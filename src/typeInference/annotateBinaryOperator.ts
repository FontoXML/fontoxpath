import { SequenceType, sequenceTypeToString, ValueType } from '../expressions/dataTypes/Value';
import { addDuration as addDurationToDateTime } from '../expressions/dataTypes/valueTypes/DateTime';
import {
  add as dayTimeDurationAdd,
  multiply as dayTimeDurationMultiply,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration,
} from '../expressions/dataTypes/valueTypes/DayTimeDuration';
import {
	add as yearMonthDurationAdd,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration,
  multiply as yearMonthDurationMultiply,
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
	[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, 'multiply')]: [
		(l: number, r: number) => l * r,
		ValueType.XSINTEGER,
	],
	[hash(ValueType.XSFLOAT, ValueType.XSFLOAT, 'multiply')]: [
		(l: number, r: number) => l * r,
		ValueType.XSFLOAT,
	],
	[hash(ValueType.XSDOUBLE, ValueType.XSDOUBLE, 'multiply')]: [
		(l: number, r: number) => l * r,
		ValueType.XSDOUBLE,
	],
	[hash(ValueType.XSDECIMAL, ValueType.XSDECIMAL, 'multiply')]: [
		(l: number, r: number) => l * r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSINTEGER, ValueType.XSINTEGER, 'multiply')]: [
		(l: number, r: number) => l * r,
		ValueType.XSDECIMAL,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSNUMERIC, 'multiply')]: [
		yearMonthDurationMultiply,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSYEARMONTHDURATION, 'multiply')]: [
		yearMonthDurationMultiply,
		ValueType.XSYEARMONTHDURATION,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSNUMERIC, 'multiply')]: [
		dayTimeDurationMultiply,
		ValueType.XSDAYTIMEDURATION,
	],
	[hash(ValueType.XSNUMERIC, ValueType.XSDAYTIMEDURATION, 'multiply')]: [
		dayTimeDurationMultiply,
    ValueType.XSDAYTIMEDURATION,
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
		`XPTY0004: ${operator} not available for types ${sequenceTypeToString(
			left
		)} and ${sequenceTypeToString(right)}`
	);
}
