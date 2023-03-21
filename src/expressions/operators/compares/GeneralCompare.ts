import castToType from '../../dataTypes/castToType';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import atomizeSequence from '../../util/atomizeSequence';
import { valueCompare } from './ValueCompare';

const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};

/**
 * A method to find the targetTypes of the operands of the generalCompare.
 *
 * @param firstType the type of the first operand
 * @param secondType the type of the second operand
 * @returns a tuple of the targetTypes, at least one of them is undefined
 */
function determineTargetType(firstType: ValueType, secondType: ValueType): [ValueType, ValueType] {
	let firstTargetType: ValueType;
	let secondTargetType: ValueType;

	if (
		isSubtypeOf(firstType, ValueType.XSUNTYPEDATOMIC) ||
		isSubtypeOf(secondType, ValueType.XSUNTYPEDATOMIC)
	) {
		if (isSubtypeOf(firstType, ValueType.XSNUMERIC)) {
			secondTargetType = ValueType.XSDOUBLE;
		} else if (isSubtypeOf(secondType, ValueType.XSNUMERIC)) {
			firstTargetType = ValueType.XSDOUBLE;
		} else if (isSubtypeOf(firstType, ValueType.XSDAYTIMEDURATION)) {
			secondTargetType = ValueType.XSDAYTIMEDURATION;
		} else if (isSubtypeOf(secondType, ValueType.XSDAYTIMEDURATION)) {
			firstTargetType = ValueType.XSDAYTIMEDURATION;
		} else if (isSubtypeOf(firstType, ValueType.XSYEARMONTHDURATION)) {
			secondTargetType = ValueType.XSYEARMONTHDURATION;
		} else if (isSubtypeOf(secondType, ValueType.XSYEARMONTHDURATION)) {
			firstTargetType = ValueType.XSYEARMONTHDURATION;
		} else if (isSubtypeOf(firstType, ValueType.XSUNTYPEDATOMIC)) {
			firstTargetType = secondType;
		} else if (isSubtypeOf(secondType, ValueType.XSUNTYPEDATOMIC)) {
			secondTargetType = firstType;
		}
	}

	return [firstTargetType, secondTargetType];
}

function generalCompare(
	operator: string,
	firstSequence: ISequence,
	secondSequence: ISequence,
	dynamicContext: DynamicContext
): ISequence {
	// Change operator to equivalent valueCompare operator
	operator = OPERATOR_TRANSLATION[operator];

	return secondSequence.mapAll((allSecondValues) =>
		firstSequence
			.filter((firstValue) => {
				for (let i = 0, l = allSecondValues.length; i < l; ++i) {
					// General comapres are value compare, with one difference:
					// If exactly one of the atomic values is an instance of xs:untypedAtomic, it is
					// cast to a type depending on the other value's dynamic type T according to the
					// following rules, in which V denotes the value to be cast:

					// If T is a numeric type or is derived from a numeric type, then V is cast to
					// xs:double.

					// If T is xs:dayTimeDuration or is derived from xs:dayTimeDuration, then V is
					// cast to xs:dayTimeDuration.

					// If T is xs:yearMonthDuration or is derived from xs:yearMonthDuration, then V
					// is cast to xs:yearMonthDuration.

					// In all other cases, V is cast to the primitive base type of T.
					let secondValue = allSecondValues[i];

					const [firstTargetType, secondTargetType]: [ValueType, ValueType] =
						determineTargetType(firstValue.type, secondValue.type);
					if (firstTargetType) firstValue = castToType(firstValue, firstTargetType);
					else if (secondTargetType)
						secondValue = castToType(secondValue, secondTargetType);

					const compareFunction = valueCompare(
						operator,
						firstValue.type,
						secondValue.type
					);

					if (compareFunction(firstValue, secondValue, dynamicContext)) {
						return true;
					}
				}
				return false;
			})
			.switchCases({
				default: () => sequenceFactory.singletonTrueSequence(),
				empty: () => sequenceFactory.singletonFalseSequence(),
			})
	);
}

export default class GeneralCompare extends Expression {
	private _firstExpression: Expression;
	private _operator: string;
	private _secondExpression: Expression;

	constructor(kind: string, firstExpression: Expression, secondExpression: Expression) {
		super(
			firstExpression.specificity.add(secondExpression.specificity),
			[firstExpression, secondExpression],
			{
				canBeStaticallyEvaluated: false,
			}
		);
		this._firstExpression = firstExpression;
		this._secondExpression = secondExpression;
		this._operator = kind;
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		const firstSequence = this._firstExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);
		const secondSequence = this._secondExpression.evaluateMaybeStatically(
			dynamicContext,
			executionParameters
		);

		return firstSequence.switchCases({
			empty: () => {
				return sequenceFactory.singletonFalseSequence();
			},
			default: () =>
				secondSequence.switchCases({
					empty: () => {
						return sequenceFactory.singletonFalseSequence();
					},
					default: () => {
						const firstAtomizedSequence = atomizeSequence(
							firstSequence,
							executionParameters
						);
						const secondAtomizedSequence = atomizeSequence(
							secondSequence,
							executionParameters
						);

						return generalCompare(
							this._operator,
							firstAtomizedSequence,
							secondAtomizedSequence,
							dynamicContext
						);
					},
				}),
		});
	}
}
