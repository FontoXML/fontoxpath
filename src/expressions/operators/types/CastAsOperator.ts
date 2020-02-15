import atomize from '../../dataTypes/atomize';
import castToType from '../../dataTypes/castToType';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import Expression from '../../Expression';

class CastAsOperator extends Expression {
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
			throw new Error('Not implemented: casting expressions with a namespace URI.');
		}

		this._expression = expression;
		this._allowsEmptySequence = allowsEmptySequence;
	}

	public evaluate(dynamicContext, executionParameters) {
		const evaluatedExpression = atomize(
			this._expression.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					throw new Error(
						'XPTY0004: Sequence to cast is empty while target type is singleton.'
					);
				}
				return sequenceFactory.empty();
			},
			singleton: () => {
				return evaluatedExpression.map(value => castToType(value, this._targetType));
			},
			multiple: () => {
				throw new Error('XPTY0004: Sequence to cast is not singleton or empty.');
			}
		});
	}
}

export default CastAsOperator;
