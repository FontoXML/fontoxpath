import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { errXPST0081 } from '../XPathErrors';
import { errXQDY0096, errXQST0040, errXQTY0024, errXQDY0025 } from './XQueryErrors';

import { isTinyNode, TinyElementNode } from '../../domClone/Pointer';
import { ConcreteAttributeNode, ConcreteChildNode, NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IAsyncIterator, IterationHint, ready } from '../util/iterators';
import AttributeConstructor from './AttributeConstructor';
import parseContent from './ElementConstructorContent';
import { evaluateQNameExpression } from './nameExpression';
import createPointerValue from '../dataTypes/createPointerValue';

class ElementConstructor extends Expression {
	private _attributes: AttributeConstructor[];
	private _contents: Expression[];
	private _name: QName;
	private _nameExpr: Expression;
	private _namespacesInScope: {};
	private _staticContext: any;

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
			resultOrder: RESULT_ORDERINGS.UNSORTED,
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
						`XQST0071: The namespace declaration with the prefix ${namespaceDecl.prefix} has already been declared on the constructed element.`
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
		const domFacade: DomFacade = executionParameters.domFacade;

		let attributePhaseDone = false;
		let attributesSequence;
		let attributeNodes;

		let childNodesPhaseDone = false;
		let childNodesSequences: ISequence[];
		let allChildNodes: Value[][];

		let nameIterator: IAsyncIterator<Value>;

		let done = false;
		return sequenceFactory.create({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				if (!attributePhaseDone) {
					if (!attributesSequence) {
						attributesSequence = concatSequences(
							this._attributes.map((attr) =>
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
						childNodesSequences = this._contents.map((contentExpression) =>
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

				const childNodes: ConcreteChildNode[] = [];
				const attributes: ConcreteAttributeNode[] = [];

				const tinyElementNode: TinyElementNode = {
					nodeType: NODE_TYPES.ELEMENT_NODE,
					isTinyNode: true,
					attributes,
					childNodes,
					nodeName: this._name.buildPrefixedName(),
					namespaceURI: this._name.namespaceURI,
					prefix: this._name.prefix,
					localName: this._name.localName,
				};

				const pointer = { node: tinyElementNode, graftAncestor: null };

				// // Plonk all attribute on the element
				attributeNodes.forEach((attr) => {
					tinyElementNode.attributes.push(attr.value.node);
				});

				// Plonk all childNodes, these are special though
				const parsedContent = parseContent(allChildNodes, executionParameters, errXQTY0024);
				parsedContent.attributes.forEach((attrNode) => {
					// The contents may include attributes, 'clone' them and set them on the element
					if (
						tinyElementNode.attributes.find(
							(attr) =>
								attr.namespaceURI === attrNode.namespaceURI &&
								attr.localName === attrNode.localName
						)
					) {
						throw errXQDY0025(attrNode.name);
					}

					tinyElementNode.attributes.push(attrNode);
				});
				parsedContent.contentNodes.forEach((childNode) => {
					tinyElementNode.childNodes.push(childNode);
				});

				// normalize
				for (let i = 0; i < tinyElementNode.childNodes.length; i++) {
					const currentChildNode = tinyElementNode.childNodes[i];

					if (
						!isTinyNode(currentChildNode) ||
						currentChildNode.nodeType !== NODE_TYPES.TEXT_NODE
					) {
						continue;
					}

					if (currentChildNode.data === '') {
						tinyElementNode.childNodes.splice(i, 1);
						i--;
						continue;
					}

					const previousChildNode = tinyElementNode.childNodes[i - 1];
					if (
						previousChildNode &&
						isTinyNode(previousChildNode) &&
						previousChildNode.nodeType === NODE_TYPES.TEXT_NODE
					) {
						previousChildNode.data = previousChildNode.data + currentChildNode.data;
						tinyElementNode.childNodes.splice(i, 1);
						i--;
					}
				}

				done = true;

				return ready(createPointerValue(pointer, domFacade));
			},
		});
	}

	public performStaticEvaluation(staticContext) {
		// Register namespace related things
		staticContext.introduceScope();
		Object.keys(this._namespacesInScope).forEach((prefix) =>
			staticContext.registerNamespace(prefix, this._namespacesInScope[prefix])
		);

		this._childExpressions.forEach((subselector) =>
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
