import Selector from '../Selector';
import Specificity from '../Specificity';

import { DONE_TOKEN, ready } from '../util/iterators';
import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import atomize from '../dataTypes/atomize';
import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import concatSequences from '../util/concatSequences';

function getAttributeValueForNamespaceDeclaration (partialValueSelectors) {
	if (!partialValueSelectors.length) {
		return null;
	}
	if (partialValueSelectors.length > 1 || typeof partialValueSelectors[0] !== 'string') {
		throw new Error('XQST0022: The value of namespace declaration attributes may not contain enclosed expressions.');
	}

	return partialValueSelectors[0];
}

/**
 * @extends {Selector}
 */
class DirElementConstructor extends Selector {
	/**
	 * @param  {string}  prefix
	 * @param  {string}  name
	 * @param  {!Array<!{name:!Array<!string>,partialValues:!Array<(!string|!Selector)>}>}  attributes
	 * @param  {!Array<!Selector>}  contents  Strings and enclosed expressions
	 */
	constructor (prefix, name, attributes, contents) {
		super(new Specificity({}), {
			canBeStaticallyEvaluated: false,
			resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
		});

		this._prefix = prefix;
		this._name = name;

		/**
		 * @type {!Object<!string, !string>}
		 */
		this._namespacesInScope = {};

		/**
		 * @type {!Array<!{qualifiedName:!{prefix:!string,localPart:!string},partialValues:!Array<(!string|!Selector)>}>}
		 */
		this._attributes = [];

		attributes.forEach(({ name, partialValues }) => {
			if (!(name[1] === 'xmlns' && name[0] === null) && name[0] !== 'xmlns') {
				this._attributes.push({
					qualifiedName: {
						prefix: name[0],
						localPart: name[1]
					},
					partialValues
				});
				return;
			}

			const namespaceURI = getAttributeValueForNamespaceDeclaration(partialValues);
			const namespacePrefix = name[0] === 'xmlns' ? name[1] : '';
			if (namespacePrefix in this._namespacesInScope) {
				throw new Error(`XQST0071: The namespace declaration with the prefix ${namespacePrefix} has already been declared on the constructed element.`);
			}
			this._namespacesInScope[namespacePrefix] = namespaceURI;
		});

		this._contents = contents;
	}

	/**
	 * @param  {!../DynamicContext} dynamicContext
	 * @return {!Sequence}
	 */
	evaluate (dynamicContext) {
		/**
		 * @type {!../DynamicContext}
		 */
		const dynamicContextWithNamespaces = dynamicContext.scopeWithNamespaceResolver(
			prefix => {
				prefix = prefix || '';
				return prefix in this._namespacesInScope ?
					this._namespacesInScope[prefix] :
					dynamicContext.resolveNamespacePrefix(prefix);
			});

		/**
		 * @type INodesFactory
		 */
		const nodesFactory = dynamicContext.nodesFactory;

		const attributes = this._attributes.map(({ qualifiedName, partialValues }) => ({
			qualifiedName,
			valueSequences: partialValues
				.map(
					value => typeof value === 'string' ?
						Sequence.singleton({ value, type: 'xs:string' }) :
					value.evaluateMaybeStatically(dynamicContextWithNamespaces).atomize(dynamicContextWithNamespaces)),
			hasAllValues: false,
			value: null
		}));

		let attributePhaseDone = false;

		let childNodesPhaseDone = false;
		let childNodesSequences;

		let done = false;
		return new Sequence({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				if (!attributePhaseDone) {
					let unfinishedAttributeRetrieve = attributes.find(attr => !attr.hasAllValues);
					while (unfinishedAttributeRetrieve) {
						const vals = unfinishedAttributeRetrieve.valueSequences.map(sequence => sequence.tryGetAllValues());
						if (vals.some(val => !val.ready)) {
							return vals.find(val => !val.ready);
						}
						unfinishedAttributeRetrieve.value = vals
							.map(val => val.value.map(v => castToType(v, 'xs:string').value).join(' ')).join('');
						unfinishedAttributeRetrieve.hasAllValues = true;
						unfinishedAttributeRetrieve = attributes.find(attr => !attr.hasAllValues);
					}
					attributePhaseDone = true;
				}

				if (!childNodesPhaseDone) {
					// Accumulate all children
					childNodesSequences = concatSequences(
						this._contents.map(
							contentSelector => contentSelector.evaluateMaybeStatically(dynamicContextWithNamespaces)
								.mapAll(allValues => new Sequence([allValues]))));
					childNodesPhaseDone = true;
				}

				const allChildNodesItrResult = childNodesSequences.tryGetAllValues();
				if (!allChildNodesItrResult.ready) {
					return allChildNodesItrResult;
				}

				const elementNamespaceURI = dynamicContextWithNamespaces.resolveNamespacePrefix(this._prefix);

				const element = nodesFactory.createElementNS(elementNamespaceURI, this._prefix ? this._prefix + ':' + this._name : this._name);

				// Plonk all attribute on the element
				attributes.forEach(attr => {
					const attrName = attr.qualifiedName.prefix ? attr.qualifiedName.prefix + ':' + attr.qualifiedName.localPart : attr.qualifiedName.localPart;
					const attributeNamespaceURI = attr.qualifiedName.prefix ? dynamicContextWithNamespaces.resolveNamespacePrefix(attr.qualifiedName.prefix) : null;
					if (element.hasAttributeNS(attributeNamespaceURI, attr.qualifiedName.localPart)) {
						throw new Error(`XQST0040: The attribute ${attrName} is already present on a constructed element.`);
					}
					element.setAttributeNS(attributeNamespaceURI, attrName, attr.value);
				});

				// Plonk all childNodes, these are special though
				allChildNodesItrResult.value.forEach(childNodes => {
					childNodes.forEach((childNode, i) => {
						if (isSubtypeOf(childNode.type, 'xs:anyAtomicType')) {
							const atomizedValue = castToType(atomize(childNode, dynamicContextWithNamespaces), 'xs:string').value;
							if (i !== 0 && isSubtypeOf(childNodes[i - 1].type, 'xs:anyAtomicType')) {
								element.appendChild(nodesFactory.createTextNode(' ' + atomizedValue));
								return;
							}
							element.appendChild(nodesFactory.createTextNode(atomizedValue));
							return;
						}
						if (isSubtypeOf(childNode.type, 'attribute()')) {
							// The contents may include attributes, 'clone' them and set them on the element
							if (element.hasAttributeNS(childNode.value.namespaceURI, childNode.value.localName)) {
								throw new Error(
									`XQST0040: The attribute ${childNode.value.name} is already present on a constructed element.`);
							}
							element.setAttributeNS(
								childNode.value.namespaceURI,
								childNode.value.prefix ?
									childNode.value.prefix + ':' + childNode.value.localName : childNode.value.localName,
								childNode.value.value);
							return;
						}

						if (isSubtypeOf(childNode.type, 'node()')) {
							// Deep clone child elements
							// TODO: skip copy if the childNode has already been created in the expression
							element.appendChild(childNode.value.cloneNode(true));
							return;
						}

						// We now only have unatomizable types left
						// (function || map) && !array
						if (isSubtypeOf(childNode.type, 'function(*)') && !isSubtypeOf(childNode.type, 'array(*)')) {
							throw new Error(`FOTY0013: Atomization is not supported for ${childNode.type}.`);
						}
						throw new Error(`Atomizing ${childNode.type} is not implemented.`);
					});
				});

				element.normalize();

				done = true;

				return ready(createNodeValue(element));
			}
		});
	}
}

export default DirElementConstructor;
