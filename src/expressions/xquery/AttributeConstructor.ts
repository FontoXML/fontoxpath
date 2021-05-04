import { TinyAttributeNode } from '../../domClone/Pointer';
import { NODE_TYPES } from '../../domFacade/ConcreteNode';
import atomize from '../dataTypes/atomize';
import createAtomicValue from '../dataTypes/createAtomicValue';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import StaticContext from '../StaticContext';
import concatSequences from '../util/concatSequences';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import { errXPST0081 } from '../XPathErrors';
import { evaluateQNameExpression } from './nameExpression';
import { errXQDY0044 } from './XQueryErrors';

function createAttribute(name, value) {
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
		value: { value: string } | { valueExprParts: Expression[] }
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
				(name as any).localName
			);
		}
		this._value = value;
		this._staticContext = undefined;
	}

	public evaluate(dynamicContext, executionParameters) {
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
								executionParameters
							);
							nameIterator = evaluateQNameExpression(
								this._staticContext,
								executionParameters,
								nameSequence
							);
						}
						const nv = nameIterator.next(IterationHint.NONE);
						name = nv.value.value;
					} else {
						name = this.name;
					}

					if (
						name &&
						(name.prefix === 'xmlns' ||
							(!name.prefix && name.localName === 'xmlns') ||
							name.namespaceURI === 'http://www.w3.org/2000/xmlns/' ||
							(name.prefix === 'xml' &&
								name.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') ||
							(name.prefix &&
								name.prefix !== 'xml' &&
								name.namespaceURI === 'http://www.w3.org/XML/1998/namespace'))
					) {
						throw errXQDY0044(name);
					}
				}

				if ((this._value as any).valueExprParts) {
					const valueExprParts = (this._value as any).valueExprParts as Expression[];
					if (!valueIterator) {
						valueIterator = concatSequences(
							valueExprParts.map((expr) => {
								return atomize(
									expr.evaluate(dynamicContext, executionParameters),
									executionParameters
								).mapAll((allValues) =>
									sequenceFactory.singleton(
										createAtomicValue(
											allValues.map((val) => val.value).join(' '),
											{
												kind: BaseType.XSSTRING,
												seqType: SequenceType.EXACTLY_ONE,
											}
										)
									)
								);
							})
						).mapAll((allValueParts) =>
							sequenceFactory.singleton(
								createPointerValue(
									createAttribute(
										name,
										allValueParts.map((val) => val.value).join('')
									),
									executionParameters.domFacade
								)
							)
						).value;
					}
					return valueIterator.next(IterationHint.NONE);
				}

				done = true;

				return ready(
					createPointerValue(
						createAttribute(name, (this._value as any).value),
						executionParameters.domFacade
					)
				);
			},
		});
	}

	public performStaticEvaluation(staticContext) {
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
