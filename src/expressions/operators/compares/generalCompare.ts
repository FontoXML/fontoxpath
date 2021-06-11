import atomize from '../../dataTypes/atomize';
import ExecutionParameters from '../../ExecutionParameters';
import castToType from '../../dataTypes/castToType';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import valueCompare from './valueCompare';

const OPERATOR_TRANSLATION: { [s: string]: string } = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};

function typeCheck(firstType: ValueType, secondType: ValueType): [ValueType, ValueType] {
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
			firstTargetType = ValueType.XSUNTYPEDATOMIC;
		} else if (isSubtypeOf(secondType, ValueType.XSUNTYPEDATOMIC)) {
			secondTargetType = firstType;
		}
	}

	return [firstTargetType, secondTargetType];
}

export default function generalCompare(
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
					if (
						isSubtypeOf(firstValue.type, ValueType.XSUNTYPEDATOMIC) ||
						isSubtypeOf(secondValue.type, ValueType.XSUNTYPEDATOMIC)
					) {
						if (isSubtypeOf(firstValue.type, ValueType.XSNUMERIC)) {
							secondValue = castToType(secondValue, ValueType.XSDOUBLE);
						} else if (isSubtypeOf(secondValue.type, ValueType.XSNUMERIC)) {
							firstValue = castToType(firstValue, ValueType.XSDOUBLE);
						} else if (isSubtypeOf(firstValue.type, ValueType.XSDAYTIMEDURATION)) {
							secondValue = castToType(secondValue, ValueType.XSDAYTIMEDURATION);
						} else if (isSubtypeOf(secondValue.type, ValueType.XSDAYTIMEDURATION)) {
							firstValue = castToType(firstValue, ValueType.XSDAYTIMEDURATION);
						} else if (isSubtypeOf(firstValue.type, ValueType.XSYEARMONTHDURATION)) {
							secondValue = castToType(secondValue, ValueType.XSYEARMONTHDURATION);
						} else if (isSubtypeOf(secondValue.type, ValueType.XSYEARMONTHDURATION)) {
							firstValue = castToType(firstValue, ValueType.XSYEARMONTHDURATION);
						} else if (isSubtypeOf(firstValue.type, ValueType.XSUNTYPEDATOMIC)) {
							firstValue = castToType(firstValue, secondValue.type);
						} else if (isSubtypeOf(secondValue.type, ValueType.XSUNTYPEDATOMIC)) {
							secondValue = castToType(secondValue, firstValue.type);
						}
					}

					if (valueCompare(operator, firstValue, secondValue, dynamicContext)) {
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

function generateGeneralCompareFunction(
	operator: string,
	firstSequence: ISequence,
	secondSequence: ISequence,
	dynamicContext: DynamicContext,
	firstTargetType: ValueType,
	secondTargetType: ValueType
): ISequence {
	return secondSequence.mapAll((allSecondValues) =>
		firstSequence
			.filter((firstValue) => {
				for (let i = 0, l = allSecondValues.length; i < l; ++i) {
					let secondValue = allSecondValues[i];
					if (firstTargetType) castToType(firstValue, firstTargetType);
					if (secondTargetType) castToType(secondValue, secondTargetType);

					if (valueCompare(operator, firstValue, secondValue, dynamicContext)) {
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

//asume at this point the sequences are of length 1
export function generatePrefabFunction(
	operator: string,
	firstType: ValueType,
	secondType: ValueType
): (
	first: ISequence,
	second: ISequence,
	dynamicContex: DynamicContext,
	executionParameters: ExecutionParameters
) => ISequence {
	operator = OPERATOR_TRANSLATION[operator];

	const [firstTargetType, secondTargetType]: [ValueType, ValueType] = typeCheck(
		firstType,
		secondType
	);

	return (
		firstSequence: ISequence,
		secondSequence: ISequence,
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence => {
		// Change operator to equivalent valueCompare operator
		return firstSequence.switchCases({
			empty: () => {
				return sequenceFactory.singletonFalseSequence();
			},
			default: () => {
				return secondSequence.switchCases({
					empty: () => {
						return sequenceFactory.singletonFalseSequence();
					},
					default: () => {
						const firstAtomizedSequence = atomize(firstSequence, executionParameters);
						const secondAtomizedSequence = atomize(secondSequence, executionParameters);
						return generateGeneralCompareFunction(
							operator,
							firstAtomizedSequence,
							secondAtomizedSequence,
							dynamicContext,
							firstTargetType,
							secondTargetType
						);
					},
				});
			},
		});
	};
}
