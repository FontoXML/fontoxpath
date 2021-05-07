import atomize from '../../dataTypes/atomize';
import { BaseType } from '../../dataTypes/BaseType';
import canCastToType from '../../dataTypes/canCastToType';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { stringToSequenceType, ValueType } from '../../dataTypes/Value';
import Expression from '../../Expression';

class CastableAsOperator extends Expression {
	public _allowsEmptySequence: boolean;
	public _expression: Expression;
	public _targetType: ValueType;

	constructor(
		expression: Expression,
		targetType: { localName: string; namespaceURI: string | null; prefix: string },
		allowsEmptySequence: boolean
	) {
		super(expression.specificity, [expression], { canBeStaticallyEvaluated: false });

		this._targetType = stringToSequenceType(
			targetType.prefix
				? `${targetType.prefix}:${targetType.localName}`
				: targetType.localName
		);
		if (
			this._targetType.kind === BaseType.XSANYATOMICTYPE ||
			this._targetType.kind === BaseType.XSANYSIMPLETYPE ||
			this._targetType.kind === BaseType.XSNOTATION
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
		const evaluatedExpression = atomize(
			this._expression.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		);
		return evaluatedExpression.switchCases({
			empty: () => {
				if (!this._allowsEmptySequence) {
					return sequenceFactory.singletonFalseSequence();
				}
				return sequenceFactory.singletonTrueSequence();
			},
			singleton: () => {
				return evaluatedExpression.map((value) =>
					canCastToType(value, this._targetType) ? trueBoolean : falseBoolean
				);
			},
			multiple: () => {
				return sequenceFactory.singletonFalseSequence();
			},
		});
	}
}

export default CastableAsOperator;
