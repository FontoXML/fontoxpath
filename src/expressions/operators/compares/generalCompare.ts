import castToType from '../../dataTypes/castToType';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { BaseType } from '../../dataTypes/Value';
import valueCompare from './valueCompare';

import ISequence from '../../dataTypes/ISequence';
import DynamicContext from '../../DynamicContext';

const OPERATOR_TRANSLATION = {
	['equalOp']: 'eqOp',
	['notEqualOp']: 'neOp',
	['lessThanOrEqualOp']: 'leOp',
	['lessThanOp']: 'ltOp',
	['greaterThanOrEqualOp']: 'geOp',
	['greaterThanOp']: 'gtOp',
};

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
						isSubtypeOf(firstValue.type, { kind: BaseType.XSUNTYPEDATOMIC }) ||
						isSubtypeOf(secondValue.type, { kind: BaseType.XSUNTYPEDATOMIC })
					) {
						if (
							isSubtypeOf(firstValue.type, {
								kind: BaseType.XSNUMERIC,
							})
						) {
							secondValue = castToType(secondValue, { kind: BaseType.XSDOUBLE });
						} else if (isSubtypeOf(secondValue.type, { kind: BaseType.XSNUMERIC })) {
							firstValue = castToType(firstValue, { kind: BaseType.XSDOUBLE });
						} else if (
							isSubtypeOf(firstValue.type, { kind: BaseType.XSDAYTIMEDURATION })
						) {
							secondValue = castToType(secondValue, {
								kind: BaseType.XSDAYTIMEDURATION,
							});
						} else if (
							isSubtypeOf(secondValue.type, { kind: BaseType.XSDAYTIMEDURATION })
						) {
							firstValue = castToType(firstValue, {
								kind: BaseType.XSDAYTIMEDURATION,
							});
						} else if (
							isSubtypeOf(firstValue.type, { kind: BaseType.XSYEARMONTHDURATION })
						) {
							secondValue = castToType(secondValue, {
								kind: BaseType.XSYEARMONTHDURATION,
							});
						} else if (
							isSubtypeOf(secondValue.type, { kind: BaseType.XSYEARMONTHDURATION })
						) {
							firstValue = castToType(firstValue, {
								kind: BaseType.XSYEARMONTHDURATION,
							});
						} else if (
							isSubtypeOf(firstValue.type, { kind: BaseType.XSUNTYPEDATOMIC })
						) {
							firstValue = castToType(firstValue, secondValue.type);
						} else if (
							isSubtypeOf(secondValue.type, { kind: BaseType.XSUNTYPEDATOMIC })
						) {
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
