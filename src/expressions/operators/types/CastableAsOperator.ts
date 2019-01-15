import canCastToType from '../../dataTypes/canCastToType';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import Expression from '../../Expression';

class CastableAsOperator extends Expression {
	public _allowsEmptySequence: boolean;
	public _expression: Expression;
	public _targetType: string;

	constructor(
		expression: Expression,
		targetType: { localName: string; namespaceURI: string | null; prefix: string },
		allowsEmptySequence: boolean
	) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });

		this._targetType = targetType.prefix
			? `${targetType.prefix}:${targetType.localName}`
			: targetType.localName;
		if (
			this._targetType === 'xs:anyAtomicType' ||
			this._targetType === 'xs:anySimpleType' ||
			this._targetType === 'xs:NOTATION'
		) {
			throw new Error(
				'XPST0080: Casting to xs:anyAtomicType, xs:anySimpleType or xs:NOTATION is not permitted.'
			);
		}

		if (targetType.namespaceURI) {
			throw new Error('Not implemented: castable as expressions with a namespace URI.');
		}

		this._expression = expression;
		this._allowsEmptySequence = allowsEmptySequence;
	}

	public evaluate(dynamicContext, executionParameters) {
		const evaluatedExpression = this._expression
			.evaluateMaybeStatically(dynamicContext, executionParameters)
			.atomize(executionParameters);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					return sequenceFactory.singletonFalseSequence();
				}
				return sequenceFactory.singletonTrueSequence();
			},
			singleton: () => {
				return evaluatedExpression.map(value =>
					canCastToType(value, this._targetType) ? trueBoolean : falseBoolean
				);
			},
			multiple: () => {
				return sequenceFactory.singletonFalseSequence();
			}
		});
	}
}

export default CastableAsOperator;
