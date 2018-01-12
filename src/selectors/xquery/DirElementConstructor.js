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
						Sequence.singleton({value, type: 'xs:string' }) :
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
					childNodesSequences = concatSequences(this._contents.map(contentSelector => contentSelector.evaluate(dynamicContextWithNamespaces)));
					childNodesPhaseDone = true;
				}

				const allChildNodesItrResult = childNodesSequences.tryGetAllValues();
				if (!allChildNodesItrResult.ready) {
					return allChildNodesItrResult;
				}

				const elementNamespaceURI = dynamicContextWithNamespaces.resolveNamespacePrefix(this._prefix);

				const element = nodesFactory.createElementNS(elementNamespaceURI, this._prefix ? this._prefix + ':' + this._name : this._name);

				attributes.forEach(attr => {
					const attrName = attr.qualifiedName.prefix ? attr.qualifiedName.prefix + ':' + attr.qualifiedName.localPart : attr.qualifiedName.localPart;
					const attributeNamespaceURI = attr.qualifiedName.prefix ? dynamicContextWithNamespaces.resolveNamespacePrefix(attr.qualifiedName.prefix) : null;
					if (element.hasAttributeNS(attributeNamespaceURI, attr.qualifiedName.localPart)) {
						throw new Error(`XQST0040: The attribute ${attrName} is already present on a constructed element.`);
					}
					element.setAttributeNS(attributeNamespaceURI, attrName, attr.value);
				});

				allChildNodesItrResult.value.forEach(childNode => {
					if (isSubtypeOf(childNode.type, 'attribute()')) {
						if (element.hasAttributeNS(childNode.value.namespaceURI, childNode.value.localName)) {
							throw new Error(`XQST0040: The attribute ${childNode.value.name} is already present on a constructed element.`);
						}
						element.setAttributeNS(
							childNode.value.namespaceURI,
							childNode.value.prefix ?
								childNode.value.prefix + ':' + childNode.value.localName : childNode.value.localName,
							childNode.value.value);
						return;
					}

					if (isSubtypeOf(childNode.type, 'node()')) {
						element.appendChild(childNode.value.cloneNode(true));
						return;
					}
					const atomizedValue = castToType(atomize(childNode, dynamicContextWithNamespaces), 'xs:string').value;
					element.appendChild(nodesFactory.createTextNode(atomizedValue));
				});

				done = true;

				return ready(createNodeValue(element));
			}
		});
	}
}

export default DirElementConstructor;
