import { AttributeNodePointer, TinyAttributeNode } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import atomize from '../dataTypes/atomize';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import { errXPST0081 } from '../XPathErrors';
import { evaluateQNameExpression } from './nameExpression';
import { errXQDY0044 } from './XQueryErrors';

function createAttribute(name: QName, value: string): AttributeNodePointer {
	const tinyAttributeNode: TinyAttributeNode = {
		nodeType: NODE_TYPES.ATTRIBUTE_NODE,
		isTinyNode: true,
		nodeName: name.buildPrefixedName(),
		namespaceURI: name.namespaceURI,
		prefix: name.prefix,
		localName: name.localName,
		name: name.buildPrefixedName(),
		value,
	};
	return { node: tinyAttributeNode, graftAncestor: null };
}

class AttributeConstructor extends Expression {
	public name: QName;
	private _nameExpr: Expression;
	private _staticContext: StaticContext;
	private _value: { value: string } | { valueExprParts: Expression[] };

	constructor(
		name: { expr: Expression } | { localName: string; namespaceURI: string; prefix: string },
		value: { value: string } | { valueExprParts: Expression[] },
	) {
		let childExpressions = (value as any).valueExprParts || [];
		childExpressions = childExpressions.concat((name as any).expr || []);
		super(new Specificity({}), childExpressions, {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		if ((name as any).expr) {
			this._nameExpr = (name as any).expr;
		} else {
			this.name = new QName(
				(name as any).prefix,
				(name as any).namespaceURI,
				(name as any).localName,
			);
		}
		this._value = value;
		this._staticContext = undefined;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		let nameIterator: IIterator<Value>;
		let name: QName;

		let valueIterator: IIterator<Value>;

		let done = false;
		return sequenceFactory.create({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}

				if (!name) {
					if (this._nameExpr) {
						if (!nameIterator) {
							const nameSequence = this._nameExpr.evaluate(
								dynamicContext,
								executionParameters,
							);
							nameIterator = evaluateQNameExpression(
								this._staticContext,
								executionParameters,
								nameSequence,
							);
						}
						const nv = nameIterator.next(IterationHint.NONE);
						name = nv.value.value;
					} else {
						name = this.name;
					}

					if (name) {
						if (name.prefix === 'xmlns') {
							throw errXQDY0044(name);
						}
						if (name.prefix === '' && name.localName === 'xmlns') {
							throw errXQDY0044(name);
						}
						if (name.namespaceURI === BUILT_IN_NAMESPACE_URIS.XMLNS_NAMESPACE_URI) {
							throw errXQDY0044(name);
						}
						if (
							name.prefix === 'xml' &&
							name.namespaceURI !== BUILT_IN_NAMESPACE_URIS.XML_NAMESPACE_URI
						) {
							throw errXQDY0044(name);
						}
						if (
							name.prefix !== '' &&
							name.prefix !== 'xml' &&
							name.namespaceURI === BUILT_IN_NAMESPACE_URIS.XML_NAMESPACE_URI
						) {
							throw errXQDY0044(name);
						}
					}
				}

				if ((this._value as any).valueExprParts) {
					const valueExprParts = (this._value as any).valueExprParts as Expression[];
					if (!valueIterator) {
						valueIterator = concatSequences(
							valueExprParts.map((expr) => {
								return atomize(
									expr.evaluate(dynamicContext, executionParameters),
									executionParameters,
								).mapAll((allValues) =>
									sequenceFactory.singleton(
										createAtomicValue(
											allValues.map((val) => val.value).join(' '),
											ValueType.XSSTRING,
										),
									),
								);
							}),
						).mapAll((allValueParts) =>
							sequenceFactory.singleton(
								createPointerValue(
									createAttribute(
										name,
										allValueParts.map((val) => val.value).join(''),
									),
									executionParameters.domFacade,
								),
							),
						).value;
					}
					return valueIterator.next(IterationHint.NONE);
				}

				done = true;

				return ready(
					createPointerValue(
						createAttribute(name, (this._value as any).value),
						executionParameters.domFacade,
					),
				);
			},
		});
	}

	public performStaticEvaluation(staticContext: StaticContext) {
		this._staticContext = staticContext.cloneContext();
		if (this.name) {
			if (this.name.prefix && !this.name.namespaceURI) {
				const namespaceURI = staticContext.resolveNamespace(this.name.prefix);
				if (namespaceURI === undefined && this.name.prefix) {
					throw errXPST0081(this.name.prefix);
				}
				this.name.namespaceURI = namespaceURI || null;
			}
		}
		super.performStaticEvaluation(staticContext);
	}
}

export default AttributeConstructor;
