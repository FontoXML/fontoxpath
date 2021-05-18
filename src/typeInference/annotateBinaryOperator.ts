import { SequenceType, sequenceTypeToString, ValueType } from '../expressions/dataTypes/Value';
import { addDuration as addDurationToDateTime } from '../expressions/dataTypes/valueTypes/DateTime';
import {
	add as dayTimeDurationAdd,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration,
} from '../expressions/dataTypes/valueTypes/DayTimeDuration';
import {
	add as yearMonthDurationAdd,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration,
} from '../expressions/dataTypes/valueTypes/YearMonthDuration';
import { IAST } from '../parsing/astHelper';
import { BinaryEvaluationFunction } from './binaryEvaluationFunction';
import { insertAttribute } from './insertAttribute';

function hash(left: ValueType, right: ValueType, op: string): number {
	return (
		((left as number) << 20) +
		((right as number) << 12) +
		(op.charCodeAt(0) << 8) +
		op.charCodeAt(1)
	);
}

type EvalFuncTable = {
	[key: number]: [BinaryEvaluationFunction, ValueType];
};

const BINOP_EVAL_FUNCTIONS: EvalFuncTable = {
	[hash(ValueType.XSINTEGER, ValueType.XSINTEGER, 'add')]: [
		(l: number, r: number) => l + r,
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSFLOAT, ValueType.XSFLOAT, 'add')]: [
		(l: number, r: number) => l + r,
		ValueType.XSFLOAT,
	],
	[hash(ValueType.XSDOUBLE, ValueType.XSDOUBLE, 'add')]: [
		(l: number, r: number) => l + r,
		ValueType.XSDOUBLE,
	],
	[hash(ValueType.XSDECIMAL, ValueType.XSDECIMAL, 'add')]: [
		(l: number, r: number) => l + r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'add')]: [
		(l: number, r: number) => l + r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'add')]: [
		yearMonthDurationAdd,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'add')]: [
		dayTimeDurationAdd,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSDAYTIMEDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDATE, ValueType.XSYEARMONTHDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDATE, ValueType.XSDAYTIMEDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSDATETIME, ValueType.XSYEARMONTHDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSTIME, ValueType.XSDAYTIMEDURATION, 'add')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSINTEGER, ValueType.XSINTEGER, 'div')]: [
		(l: number, r: number) => l / r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSFLOAT, ValueType.XSFLOAT, 'div')]: [
		(l: number, r: number) => l / r,
		ValueType.XSFLOAT,
	],
	[hash(ValueType.XSDOUBLE, ValueType.XSDOUBLE, 'div')]: [
		(l: number, r: number) => l / r,
		ValueType.XSDOUBLE,
	],
	[hash(ValueType.XSDECIMAL, ValueType.XSDECIMAL, 'div')]: [
		(l: number, r: number) => l / r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'div')]: [
		(l: number, r: number) => l / r,
		ValueType.XSDOUBLE,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSYEARMONTHDURATION, 'div')]: [
		yearMonthDurationDivideByYearMonthDuration,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSINTEGER, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSFLOAT, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDOUBLE, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDECIMAL, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDAYTIMEDURATION, 'div')]: [
		dayTimeDurationDivideByDayTimeDuration,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSINTEGER, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSFLOAT, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDOUBLE, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDECIMAL, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'div')]: [
		yearMonthDurationDivide,
		ValueType.XSDAYTIMEDURATION,
	],

	// Integer Division, numerator and denominator of the same type
	[hash(ValueType.XSINTEGER, ValueType.XSINTEGER, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSFLOAT, ValueType.XSFLOAT, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSDOUBLE, ValueType.XSDOUBLE, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSDECIMAL, ValueType.XSDECIMAL, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],

	// Integer Division, float over integer
	[hash(ValueType.XSFLOAT, ValueType.XSINTEGER, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	// Integer Division, integer over float
	[hash(ValueType.XSINTEGER, ValueType.XSFLOAT, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],

	// Integer Division, double over integer
	[hash(ValueType.XSDOUBLE, ValueType.XSINTEGER, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	// Integer Division, integer over double
	[hash(ValueType.XSINTEGER, ValueType.XSDOUBLE, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],

	// Integer Division, decimal over integer
	[hash(ValueType.XSDECIMAL, ValueType.XSINTEGER, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	// Integer Division, integer over decimal
	[hash(ValueType.XSINTEGER, ValueType.XSDECIMAL, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],

	// Integer Division, numeric over integer
	[hash(ValueType.XSNUMERIC, ValueType.XSINTEGER, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
	// Integer Division, integer over numeric
	[hash(ValueType.XSINTEGER, ValueType.XSNUMERIC, 'idiv')]: [
		(l: number, r: number) => Math.trunc(l / r),
		ValueType.XSINTEGER,
	],
};

export function annotateBinOp(
	ast: IAST,
	left: SequenceType | undefined,
	right: SequenceType | undefined,
	operator: string
): SequenceType | undefined {
	if (!left || !right) {
		return undefined;
	}

	if (left.mult !== right.mult) {
		throw new Error("Multiplicities in binary addition operator don't match");
	}

	const funcData: [BinaryEvaluationFunction, ValueType] | undefined =
		BINOP_EVAL_FUNCTIONS[hash(left.type, right.type, operator)];

	if (funcData) {
		const type = { type: funcData[1], mult: left.mult };
		insertAttribute(ast, 'type', type);
		insertAttribute(ast, 'evalFunc', funcData[0]);
		return type;
	}

	throw new Error(
		`XPTY0004: Addition not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
