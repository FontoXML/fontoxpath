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

/**
 * A hash function that is used to create the keys for the ruleMap.
 * @param left the ValueType of the left part of the operator
 * @param right the ValueType of the right part of the operator
 * @param op the operator
 * @returns a number that can be used as a key
 */
export function hash(left: ValueType, right: ValueType, op: string): number {
	return (
		((left as number) << 20) +
		((right as number) << 12) +
		(op.charCodeAt(0) << 8) +
		op.charCodeAt(1)
	);
}

type EvalFuncTable = {
	[key: number]: [(a: any, b: any) => any, ValueType];
};

/**
 * The map with every possible combination of operands.
 * returns both a function that needs to be applied to the operands and the returnType of the operation.
 */
export const ruleMap: EvalFuncTable = {
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'addOp')]: [(a, b) => a + b, undefined],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'subtractOp')]: [(a, b) => a - b, undefined],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'multiplyOp')]: [(a, b) => a * b, undefined],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'divOp')]: [(a, b) => a / b, undefined],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'modOp')]: [(a, b) => a % b, undefined],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'idivOp')]: [
		(a, b) => Math.trunc(a / b),
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'addOp')]: [
		yearMonthDurationAdd,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: [
		yearMonthDurationSubtract,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'divOp')]: [
		yearMonthDurationDivideByYearMonthDuration,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'multiplyOp')]: [
		yearMonthDurationMultiply,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'divOp')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSYEARMONTHDURATION, 'multiplyOp')]: [
		(a, b) => yearMonthDurationMultiply(b, a),
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		dayTimeDurationAdd,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		dayTimeDurationSubtract,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'divOp')]: [
		dayTimeDurationDivideByDayTimeDuration,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'multiplyOp')]: [
		dayTimeDurationMultiply,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'divOp')]: [
		dayTimeDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSDAYTIMEDURATION, 'multiplyOp')]: [
		(a, b) => dayTimeDurationMultiply(b, a),
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDATETIME, 'subtractOp')]: [
		dateTimeSubtract,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDATE, ValueType.XSDATE, 'subtractOp')]: [
		dateTimeSubtract,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSTIME, ValueType.XSTIME, 'subtractOp')]: [
		dateTimeSubtract,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSTIME,
	],
};
