import { ValueType } from '../../../expressions/dataTypes/Value';
import {
	addDuration as addDurationToDateTime,
	subtract as dateTimeSubtract,
	subtractDuration as subtractDurationFromDateTime,
} from '../../../expressions/dataTypes/valueTypes/DateTime';
import {
	add as dayTimeDurationAdd,
	divide as dayTimeDurationDivide,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration,
	multiply as dayTimeDurationMultiply,
	subtract as dayTimeDurationSubtract,
} from '../../../expressions/dataTypes/valueTypes/DayTimeDuration';
import {
	add as yearMonthDurationAdd,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration,
	multiply as yearMonthDurationMultiply,
	subtract as yearMonthDurationSubtract,
} from '../../../expressions/dataTypes/valueTypes/YearMonthDuration';

const SHIFT_FIRST_ARGUMENT_OF_HASH_BY = 20;
const SHIFT_SECOND_ARGUMENT_OF_HASH_BY = 12;
const SHIFT_THIRD_ARGUMENT_OF_HASH_BY = 8;

/**
 * A hash function that is used to create the keys for the ruleMap.
 * @param left the ValueType of the left part of the operator
 * @param right the ValueType of the right part of the operator
 * @param op the operator
 * @returns a number that can be used as a key
 */
export function hash(left: ValueType, right: ValueType, op: string): number {
	return (
		((left as number) << SHIFT_FIRST_ARGUMENT_OF_HASH_BY) +
		((right as number) << SHIFT_SECOND_ARGUMENT_OF_HASH_BY) +
		(op.charCodeAt(0) << SHIFT_THIRD_ARGUMENT_OF_HASH_BY) +
		op.charCodeAt(1)
	);
}

/**
 * The map with every possible combination of operands.
 * returns a the return type of the operation.
 */
export const returnTypeMap: { [key: number]: ValueType } = {
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'idivOp')]: ValueType.XSINTEGER,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'addOp')]:
		ValueType.XSYEARMONTHDURATION,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		ValueType.XSYEARMONTHDURATION,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'divOp')]:
		ValueType.XSDECIMAL,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'multiplyOp')]:
		ValueType.XSYEARMONTHDURATION,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'divOp')]:
		ValueType.XSYEARMONTHDURATION,
	[hash(ValueType.XSNUMERIC, ValueType.XSYEARMONTHDURATION, 'multiplyOp')]:
		ValueType.XSYEARMONTHDURATION,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'addOp')]:
		ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'divOp')]: ValueType.XSDECIMAL,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'multiplyOp')]:
		ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'divOp')]: ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSNUMERIC, ValueType.XSDAYTIMEDURATION, 'multiplyOp')]:
		ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDATETIME, ValueType.XSDATETIME, 'subtractOp')]: ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDATE, ValueType.XSDATE, 'subtractOp')]: ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSTIME, ValueType.XSTIME, 'subtractOp')]: ValueType.XSDAYTIMEDURATION,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSDATE,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSTIME,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSTIME,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSDATETIME,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: ValueType.XSDATE,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: ValueType.XSDATE,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: ValueType.XSTIME,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: ValueType.XSTIME,
};

/**
 * The map with every possible combination of operands.
 * returns a function that needs to be applied to the operands.
 */
export const operationMap: { [key: number]: (a: any, b: any) => any } = {
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'addOp')]: (a, b) => a + b,
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'subtractOp')]: (a, b) => a - b,
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'multiplyOp')]: (a, b) => a * b,
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'divOp')]: (a, b) => a / b,
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'modOp')]: (a, b) => a % b,
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'idivOp')]: (a, b) => Math.trunc(a / b),
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'addOp')]:
		yearMonthDurationAdd,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		yearMonthDurationSubtract,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'divOp')]:
		yearMonthDurationDivideByYearMonthDuration,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'multiplyOp')]:
		yearMonthDurationMultiply,
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'divOp')]: yearMonthDurationDivide,
	[hash(ValueType.XSNUMERIC, ValueType.XSYEARMONTHDURATION, 'multiplyOp')]: (a, b) =>
		yearMonthDurationMultiply(b, a),
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'addOp')]: dayTimeDurationAdd,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		dayTimeDurationSubtract,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'divOp')]:
		dayTimeDurationDivideByDayTimeDuration,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'multiplyOp')]: dayTimeDurationMultiply,
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'divOp')]: dayTimeDurationDivide,
	[hash(ValueType.XSNUMERIC, ValueType.XSDAYTIMEDURATION, 'multiplyOp')]: (a, b) =>
		dayTimeDurationMultiply(b, a),
	[hash(ValueType.XSDATETIME, ValueType.XSDATETIME, 'subtractOp')]: dateTimeSubtract,
	[hash(ValueType.XSDATE, ValueType.XSDATE, 'subtractOp')]: dateTimeSubtract,
	[hash(ValueType.XSTIME, ValueType.XSTIME, 'subtractOp')]: dateTimeSubtract,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: addDurationToDateTime,
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]:
		subtractDurationFromDateTime,
};
