import AtomicValue from '../expressions/dataTypes/AtomicValue';
import castToType from '../expressions/dataTypes/castToType';
import createAtomicValue from '../expressions/dataTypes/createAtomicValue';
import isSubtypeOf from '../expressions/dataTypes/isSubtypeOf';
import { SequenceType, sequenceTypeToString, ValueType } from '../expressions/dataTypes/Value';
import {
	addDuration as addDurationToDateTime,
	subtract as dateTimeSubtract,
	subtractDuration as subtractDurationFromDateTime,
} from '../expressions/dataTypes/valueTypes/DateTime';
import {
	add as dayTimeDurationAdd,
	divide as dayTimeDurationDivide,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration,
	multiply as dayTimeDurationMultiply,
	subtract as dayTimeDurationSubtract,
} from '../expressions/dataTypes/valueTypes/DayTimeDuration';
import {
	add as yearMonthDurationAdd,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration,
	multiply as yearMonthDurationMultiply,
	subtract as yearMonthDurationSubtract,
} from '../expressions/dataTypes/valueTypes/YearMonthDuration';
import { IAST } from '../parsing/astHelper';
import { insertAttribute } from './insertAttribute';

function determineReturnType(typeA: ValueType, typeB: ValueType): ValueType {
	if (isSubtypeOf(typeA, ValueType.XSINTEGER) && isSubtypeOf(typeB, ValueType.XSINTEGER)) {
		return ValueType.XSINTEGER;
	}
	if (isSubtypeOf(typeA, ValueType.XSDECIMAL) && isSubtypeOf(typeB, ValueType.XSDECIMAL)) {
		return ValueType.XSDECIMAL;
	}
	if (isSubtypeOf(typeA, ValueType.XSFLOAT) && isSubtypeOf(typeB, ValueType.XSFLOAT)) {
		return ValueType.XSFLOAT;
	}
	return ValueType.XSDOUBLE;
}

const allTypes = [
	ValueType.XSNUMERIC,
	ValueType.XSYEARMONTHDURATION,
	ValueType.XSDAYTIMEDURATION,
	ValueType.XSDATETIME,
	ValueType.XSDATE,
	ValueType.XSTIME,
];

function hash(left: ValueType, right: ValueType, op: string): number {
	return (
		((left as number) << 20) +
		((right as number) << 12) +
		(op.charCodeAt(0) << 8) +
		op.charCodeAt(1)
	);
}

type EvalFuncTable = {
	[key: number]: [Function, ValueType];
};

const ruleMap: EvalFuncTable = {
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
		yearMonthDurationMultiply,
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
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDATETIME, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDATETIME, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATETIME,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDATE, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSDATE, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDATE, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSDATE, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSDATE,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSTIME, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSDAYTIMEDURATION, ValueType.XSTIME, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSTIME, 'addOp')]: [
		addDurationToDateTime,
		ValueType.XSTIME,
	],
	[hash(ValueType.XSYEARMONTHDURATION, ValueType.XSTIME, 'subtractOp')]: [
		subtractDurationFromDateTime,
		ValueType.XSTIME,
	],
};

function generateBinaryOperatorFunction(
	operator,
	typeA: ValueType,
	typeB: ValueType
): [(a: any, b: any) => AtomicValue, ValueType] {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (value) => castToType(value, ValueType.XSDOUBLE);
		typeA = ValueType.XSDOUBLE;
	}
	if (isSubtypeOf(typeB, ValueType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (value) => castToType(value, ValueType.XSDOUBLE);
		typeB = ValueType.XSDOUBLE;
	}

	let parentTypesOfA = allTypes.filter((e) => isSubtypeOf(typeA, e));
	let parentTypesOfB = allTypes.filter((e) => isSubtypeOf(typeB, e));
	let [fun, retType] = [undefined, undefined];

	function applyCastFunctions(valueA: AtomicValue, valueB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	if (
		parentTypesOfA.includes(ValueType.XSNUMERIC) &&
		parentTypesOfB.includes(ValueType.XSNUMERIC)
	) {
		[fun, retType] = ruleMap[hash(ValueType.XSNUMERIC, ValueType.XSNUMERIC, operator)];
		if (!retType) retType = determineReturnType(typeA, typeB);
		if (operator === 'divOp' && retType === ValueType.XSINTEGER) retType = ValueType.XSDECIMAL;
		if (operator === 'idivOp') return idDivOpChecksFunction(applyCastFunctions, fun);
		return [
			(a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(fun(castA.value, castB.value), retType);
			},
			retType,
		];
	}

	for (var typeOfA of parentTypesOfA) {
		for (var typeOfB of parentTypesOfB) {
			[fun, retType] = ruleMap[hash(typeOfA, typeOfB, operator)];
			if (fun) {
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(fun(castA.value, castB.value), retType);
					},
					retType,
				];
			}
		}
	}
	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}

function idDivOpChecksFunction(
	applyCastFunctions: Function,
	fun: Function
): [(a: any, b: any) => AtomicValue, ValueType] {
	return [
		(a, b) => {
			const { castA, castB } = applyCastFunctions(a, b);
			if (castB.value === 0) {
				throw new Error('FOAR0001: Divisor of idiv operator cannot be (-)0');
			}
			if (
				Number.isNaN(castA.value) ||
				Number.isNaN(castB.value) ||
				!Number.isFinite(castA.value)
			) {
				throw new Error(
					'FOAR0002: One of the operands of idiv is NaN or the first operand is (-)INF'
				);
			}
			if (Number.isFinite(castA.value) && !Number.isFinite(castB.value)) {
				return createAtomicValue(0, ValueType.XSINTEGER);
			}
			return createAtomicValue(fun(castA.value, castB.value), ValueType.XSINTEGER);
		},
		ValueType.XSINTEGER,
	];
}

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

	const funcData = generateBinaryOperatorFunction(operator, left.type, right.type);

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
