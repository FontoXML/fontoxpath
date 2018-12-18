import { errXPST0081 } from '../XPathErrors';
import { errXQTY0024, errXQDY0025, errXQST0040, errXQDY0096 } from './XQueryErrors';
import Expression from '../Expression';
import Specificity from '../Specificity';

import { evaluateQNameExpression } from './nameExpressions';
import { DONE_TOKEN, ready } from '../util/iterators';
import createNodeValue from '../dataTypes/createNodeValue';
import Sequence from '../dataTypes/Sequence';
import concatSequences from '../util/concatSequences';
import AttributeConstructor from './AttributeConstructor';
import parseContent from './ElementConstructorContent';
import QName from '../dataTypes/valueTypes/QName';

/**
 * @extends {Expression}
 */
class ElementConstructor extends Expression {
	/**
	 * @param  {{expr: Expression}|{prefix:string, namespaceURI: ?string, localName: string}} name
	 * @param  {!Array<!AttributeConstructor>}  attributes
	 * @param  {!Array<!{prefix: string, uri: string}>}     namespaceDeclarations
	 * @param  {!Array<!Expression>}  contents  Strings and enclosed expressions
	 */
	constructor (name, attributes, namespaceDeclarations, contents) {
		super(
			new Specificity({}),
			contents.concat(attributes).concat(name.expr || []),
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		if (name.expr) {
			this._nameExpr = name.expr;
		} else {
			this._name = new QName(name.prefix, name.namespaceURI, name.localName);
		}

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
		this._staticContext = undefined;
	}

	performStaticEvaluation (staticContext) {
		// Register namespace related things
		staticContext.introduceScope();
		Object.keys(this._namespacesInScope)
			.forEach(prefix => staticContext.registerNamespace(prefix, this._namespacesInScope[prefix]));

		this._childExpressions.forEach(subselector => subselector.performStaticEvaluation(staticContext));

		this._attributes.reduce((attributeNames, attribute) => {
			// We can not throw a static error for computed attribute constructor of which we do not yet know the name
			if (attribute.name) {
				const attributeNamespaceURI = attribute.name.namespaceURI || staticContext.resolveNamespace(attribute.name.prefix);
				const uriQualifiedName = `Q{${attributeNamespaceURI}}${attribute.name.localPart}`;
				if (attributeNames.includes(uriQualifiedName)) {
					throw errXQST0040(uriQualifiedName);
				}
				attributeNames.push(uriQualifiedName);
			}
			return attributeNames;
		}, []);

		if (this._name) {
			const namespaceURI = staticContext.resolveNamespace(this._name.prefix);
			if (namespaceURI === undefined && this._name.prefix) {
				throw errXPST0081(this._name.prefix);
			}
			this._name.namespaceURI = namespaceURI || null;
		}

		this._staticContext = staticContext.cloneContext();
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

				if (this._nameExpr) {
					const nameSequence = this._nameExpr.evaluate(dynamicContext, executionParameters);
					this._name = evaluateQNameExpression(this._staticContext, executionParameters, nameSequence);
				}

				if (this._name.prefix === 'xmlns' ||
				this._name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
				(this._name.prefix === 'xml' && this._name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
				(this._name.prefix && this._name.prefix !== 'xml' && this._name.namespaceURI === 'http://www.w3.org/XML/1998/namespace')) {
					throw errXQDY0096(this._name);
				}

				const element = nodesFactory.createElementNS(
					this._name.namespaceURI,
					this._name.buildPrefixedName());

				// Plonk all attribute on the element
				attributeNodes.forEach(attr => {
					element.setAttributeNodeNS(attr.value);
				});

				// Plonk all childNodes, these are special though
				const parsedContent = parseContent(allChildNodesItrResult.value, executionParameters, errXQTY0024);
				parsedContent.attributes.forEach(attrNode => {
					// The contents may include attributes, 'clone' them and set them on the element
					if (element.hasAttributeNS(attrNode.namespaceURI, attrNode.localName)) {
						throw errXQDY0025(attrNode.name);
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

export default ElementConstructor;
