import AtomicValue from '../../dataTypes/AtomicValue';
import castToType from '../../dataTypes/castToType';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceMultiplicity, SequenceType, ValueType } from '../../dataTypes/Value';
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

/**
 * A method to find the targetTypes of the operands of the generalCompare.
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

					const [firstTargetType, secondTargetType]: [
						ValueType,
						ValueType
					] = determineTargetType(firstValue.type, secondValue.type);
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

/**
 * A function that uses the typeInformation from the annotation to determine an evaluationFunction.
 * @param operator The compare operator
 * @param firstType The type of the left operand
 * @param secondType The type of the right operand
 * @returns The evaluation function
 */
export function getGeneralCompareEvaluationFunction(
	operator: string,
	firstType: SequenceType,
	secondType: SequenceType
): (first: ISequence, second: ISequence, dynamicContex: DynamicContext) => boolean {
	operator = OPERATOR_TRANSLATION[operator];

	const [firstTargetType, secondTargetType]: [ValueType, ValueType] = determineTargetType(
		firstType.type,
		secondType.type
	);
	const compareFunction = valueCompare(operator, firstType.type, secondType.type);

	if (
		firstType.mult === SequenceMultiplicity.ZERO_OR_ONE &&
		secondType.mult === SequenceMultiplicity.ZERO_OR_ONE
	) {
		return generateSingleGeneralCompareFunction(
			firstTargetType,
			secondTargetType,
			compareFunction
		);
	} else {
		return generateMultipleGeneralCompareFunction(
			firstTargetType,
			secondTargetType,
			compareFunction
		);
	}
}

/**
 * A function to generate the GeneralCompareFunction when the multiplicity is ZERO_OR_MORE or ONE_OR_MORE.
 * @param firstTargetType If the type is defined cast the left operand to this type
 * @param secondTargetType If the type is defined cast the right operand to this type
 * @param compareFunction The generated valueCompareFunction
 * @returns The GeneralCompare evaluation function
 */
function generateMultipleGeneralCompareFunction(
	firstTargetType: ValueType,
	secondTargetType: ValueType,
	compareFunction: (
		first: AtomicValue,
		second: AtomicValue,
		dynamicContex: DynamicContext
	) => boolean
) {
	return (
		firstSequence: ISequence,
		secondSequence: ISequence,
		dynamicContext: DynamicContext
	): boolean => {
		let result;
		result = secondSequence.mapAll((allSecondValues) =>
			firstSequence
				.filter((firstValue) => {
					for (let i = 0, l = allSecondValues.length; i < l; ++i) {
						let secondValue = allSecondValues[i];
						if (firstTargetType) {
							firstValue = castToType(firstValue, firstTargetType);
						}
						if (secondTargetType) {
							secondValue = castToType(secondValue, secondTargetType);
						}
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

		return result.getEffectiveBooleanValue();
	};
}

/**
 * A function to generate the GeneralCompareFunction when the multiplicity is ZERO_OR_ONE.
 * @param firstTargetType If the type is defined cast the left operand to this type
 * @param secondTargetType If the type is defined cast the right operand to this type
 * @param compareFunction The generated valueCompareFunction
 * @returns The GeneralCompare evaluation function
 */
function generateSingleGeneralCompareFunction(
	firstTargetType: ValueType,
	secondTargetType: ValueType,
	compareFunction: (
		first: AtomicValue,
		second: AtomicValue,
		dynamicContex: DynamicContext
	) => boolean
) {
	return (
		firstSequence: ISequence,
		secondSequence: ISequence,
		dynamicContext: DynamicContext
	): boolean => {
		if (firstSequence.isEmpty() || secondSequence.isEmpty()) {
			return false;
		} else {
			let firstValue = firstSequence.first();
			let secondValue = secondSequence.first();
			if (firstTargetType) firstValue = castToType(firstValue, firstTargetType);
			if (secondTargetType) secondValue = castToType(secondValue, secondTargetType);
			return compareFunction(firstValue, secondValue, dynamicContext);
		}
	};
}
