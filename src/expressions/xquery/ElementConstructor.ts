import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { errXPST0081 } from '../XPathErrors';
import { errXQDY0025, errXQDY0096, errXQST0040, errXQTY0024 } from './XQueryErrors';

import createNodeValue from '../dataTypes/createNodeValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import concatSequences from '../util/concatSequences';
import { AsyncIterator, DONE_TOKEN, IterationHint, ready } from '../util/iterators';
import AttributeConstructor from './AttributeConstructor';
import parseContent from './ElementConstructorContent';
import { evaluateQNameExpression } from './nameExpression';

class ElementConstructor extends Expression {
	public _attributes: AttributeConstructor[];
	public _contents: Expression[];
	public _name: QName;
	public _nameExpr: Expression;
	public _namespacesInScope: {};
	public _staticContext: any;

	constructor(
		name:
			| { expr: Expression }
			| { localName: string; namespaceURI: string | null; prefix: string },
		attributes: AttributeConstructor[],
		namespaceDeclarations: { prefix: string; uri: string }[],
		contents: Expression[]
	) {
		super(new Specificity({}), contents.concat(attributes).concat((name as any).expr || []), {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		if ((name as any).expr) {
			this._nameExpr = (name as any).expr;
		} else {
			this._name = new QName(
				(name as any).prefix,
				(name as any).namespaceURI,
				(name as any).localName
			);
		}

		this._namespacesInScope = namespaceDeclarations.reduce(
			(namespacesInScope, namespaceDecl) => {
				if (namespaceDecl.prefix in namespacesInScope) {
					throw new Error(
						`XQST0071: The namespace declaration with the prefix ${
							namespaceDecl.prefix
						} has already been declared on the constructed element.`
					);
				}
				namespacesInScope[namespaceDecl.prefix] = namespaceDecl.uri;
				return namespacesInScope;
			},
			{}
		);

		this._attributes = attributes;

		this._contents = contents;
		this._staticContext = undefined;
	}

	public evaluate(dynamicContext, executionParameters) {
		const nodesFactory = executionParameters.nodesFactory;

		let attributePhaseDone = false;
		let attributesSequence;
		let attributeNodes;

		let childNodesPhaseDone = false;
		let childNodesSequences: ISequence[];
		let allChildNodes: Value[][];

		let nameIterator: AsyncIterator<Value>;

		let done = false;
		return sequenceFactory.create({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				if (!attributePhaseDone) {
					if (!attributesSequence) {
						attributesSequence = concatSequences(
							this._attributes.map(attr =>
								attr.evaluateMaybeStatically(dynamicContext, executionParameters)
							)
						);
					}

					const allAttributes = attributesSequence.tryGetAllValues();
					if (!allAttributes.ready) {
						return allAttributes;
					}
					attributeNodes = allAttributes.value;
					attributePhaseDone = true;
				}

				if (!childNodesPhaseDone) {
					if (!childNodesSequences) {
						// Accumulate all children
						childNodesSequences = this._contents.map(contentExpression =>
							contentExpression.evaluateMaybeStatically(
								dynamicContext,
								executionParameters
							)
						);
					}

					const childNodes: Value[][] = [];
					for (let i = 0; i < childNodesSequences.length; i++) {
						const allValues = childNodesSequences[i].tryGetAllValues();
						if (!allValues.ready) {
							return allValues;
						}
						childNodes.push(allValues.value);
					}
					allChildNodes = childNodes;
					childNodesPhaseDone = true;
				}

				if (this._nameExpr) {
					if (!nameIterator) {
						const nameSequence = this._nameExpr.evaluate(
							dynamicContext,
							executionParameters
						);
						nameIterator = evaluateQNameExpression(
							this._staticContext,
							executionParameters,
							nameSequence
						);
					}
					const nv = nameIterator.next(IterationHint.NONE);
					if (!nv.ready) {
						return nv;
					}
					this._name = nv.value.value;
				}

				if (
					this._name.prefix === 'xmlns' ||
					this._name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
					(this._name.prefix === 'xml' &&
						this._name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
					(this._name.prefix &&
						this._name.prefix !== 'xml' &&
						this._name.namespaceURI === 'http://www.w3.org/XML/1998/namespace')
				) {
					throw errXQDY0096(this._name);
				}

				const element = nodesFactory.createElementNS(
					this._name.namespaceURI,
					this._name.buildPrefixedName()
				);

				// Plonk all attribute on the element
				attributeNodes.forEach(attr => {
					element.setAttributeNodeNS(attr.value);
				});

				// Plonk all childNodes, these are special though
				const parsedContent = parseContent(allChildNodes, executionParameters, errXQTY0024);
				parsedContent.attributes.forEach(attrNode => {
					// The contents may include attributes, 'clone' them and set them on the element
					if (element.hasAttributeNS(attrNode.namespaceURI, attrNode.localName)) {
						throw errXQDY0025(attrNode.name);
					}
					element.setAttributeNS(
						attrNode.namespaceURI,
						attrNode.prefix
							? attrNode.prefix + ':' + attrNode.localName
							: attrNode.localName,
						attrNode.value
					);
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

	public performStaticEvaluation(staticContext) {
		// Register namespace related things
		staticContext.introduceScope();
		Object.keys(this._namespacesInScope).forEach(prefix =>
			staticContext.registerNamespace(prefix, this._namespacesInScope[prefix])
		);

		this._childExpressions.forEach(subselector =>
			subselector.performStaticEvaluation(staticContext)
		);

		this._attributes.reduce((attributeNames, attribute) => {
			// We can not throw a static error for computed attribute constructor of which we do not yet know the name
			if (attribute.name) {
				const attributeNamespaceURI =
					attribute.name.namespaceURI ||
					staticContext.resolveNamespace(attribute.name.prefix);
				const uriQualifiedName = `Q{${attributeNamespaceURI}}${attribute.name.localName}`;
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
}

export default ElementConstructor;
