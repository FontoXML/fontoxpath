import Expression from '../Expression';
import Specificity from '../Specificity';

import { DONE_TOKEN, ready } from '../util/iterators';
import createNodeValue from '../dataTypes/createNodeValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import atomize from '../dataTypes/atomize';
import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import concatSequences from '../util/concatSequences';
import parseContent from '../ElementConstructorContent';

/**
 * @extends {Expression}
 */
class DirElementConstructor extends Expression {
	/**
	 * @param  {{prefix:string, namespaceURI: ?string, localName: string}} name
	 * @param  {!Array<!Expression>}  attributes
	 * @param  {!Array<!{prefix: string, uri: string}>}     namespaceDeclarations
	 * @param  {!Array<!Expression>}  contents  Strings and enclosed expressions
	 */
	constructor (name, attributes, namespaceDeclarations, contents) {
		super(
			new Specificity({}),
			contents.concat(attributes),
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._prefix = name.prefix;
		this._name = name.localName;
		/**
		 * @type {string|null}
		 */
		this._namespaceURI = null;

		/**
		 * @type {!Object<!string, !string>}
		 */
		this._namespacesInScope = namespaceDeclarations.reduce(
			(namespacesInScope, namespaceDecl) => {
				if (namespaceDecl.prefix in namespacesInScope) {
					throw new Error(`XQST0071: The namespace declaration with the prefix ${namespaceDecl.prefix} has already been declared on the constructed element.`);
				}
				namespacesInScope[namespaceDecl.prefix] = namespaceDecl.uri;
				return namespacesInScope;
			}, {});


		this._attributes = attributes;

		this._contents = contents;
	}

	performStaticEvaluation (staticContext) {
		// Register namespace related things
		staticContext.introduceScope();
		Object.keys(this._namespacesInScope)
			.forEach(prefix => staticContext.registerNamespace(prefix, this._namespacesInScope[prefix]));

		this._childExpressions.forEach(subselector => subselector.performStaticEvaluation(staticContext));

		const namespaceURI = staticContext.resolveNamespace(this._prefix);

		if (namespaceURI === undefined && this._prefix) {
			throw new Error(`XPST0081: The prefix ${this._prefix} could not be resolved.`);
		}
		this._namespaceURI = namespaceURI || null;

		staticContext.removeScope();
	}

	evaluate (dynamicContext, executionParameters) {
		/**
		 * @type {INodesFactory}
		 */
		const nodesFactory = executionParameters.nodesFactory;

		let attributesSequence;
		let attributeNodes;

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
					if (!attributesSequence) {
						attributesSequence = concatSequences(
							this._attributes
								.map(attr => attr.evaluateMaybeStatically(dynamicContext, executionParameters)));
					}

					const allAttributes = attributesSequence.tryGetAllValues();
					if (!allAttributes.ready) {
						return allAttributes;
					}
					attributeNodes = allAttributes.value;
					attributePhaseDone = true;
				}

				if (!childNodesPhaseDone) {
					// Accumulate all children
					childNodesSequences = concatSequences(
						this._contents.map(
							contentExpression => contentExpression.evaluateMaybeStatically(dynamicContext, executionParameters)
								.mapAll(allValues => new Sequence([allValues]))));
					childNodesPhaseDone = true;
				}

				const allChildNodesItrResult = childNodesSequences.tryGetAllValues();
				if (!allChildNodesItrResult.ready) {
					return allChildNodesItrResult;
				}

				const element = nodesFactory.createElementNS(
					this._namespaceURI,
					this._prefix ? this._prefix + ':' + this._name : this._name);

				// Plonk all attribute on the element
				attributeNodes.forEach(attr => {
					if (element.hasAttributeNS(attr.value.namespaceURI, attr.value.localName)) {
						throw new Error(`XQST0040: The attribute ${attr.value.name} is already present on a constructed element.`);
					}
					element.setAttributeNodeNS(attr.value);
				});

				// Plonk all childNodes, these are special though
				const parsedContent = parseContent(allChildNodesItrResult.value, executionParameters);
				parsedContent.attributes.forEach(attrNode => {
					// The contents may include attributes, 'clone' them and set them on the element
					if (element.hasAttributeNS(attrNode.namespaceURI, attrNode.localName)) {
						throw new Error(`XQST0040: The attribute ${attrNode.name} is already present on a constructed element.`);
					}
					element.setAttributeNS(
						attrNode.namespaceURI,
						attrNode.prefix ?
							attrNode.prefix + ':' + attrNode.localName : attrNode.localName,
						attrNode.value);
				});
				parsedContent.contentNodes.forEach(childNode => {
					element.appendChild(childNode);
				});

				element.normalize();

				done = true;

				return ready(createNodeValue(element));
			}
		});
	}
}

export default DirElementConstructor;
