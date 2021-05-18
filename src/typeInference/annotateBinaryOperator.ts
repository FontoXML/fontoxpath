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

	function applyCastFunctions(valueA: AtomicValue, valueB: AtomicValue) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	if (isSubtypeOf(typeA, ValueType.XSNUMERIC) && isSubtypeOf(typeB, ValueType.XSNUMERIC)) {
		switch (operator) {
			case 'addOp': {
				const returnType = determineReturnType(typeA, typeB);
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);

						return createAtomicValue(castA.value + castB.value, returnType);
					},
					returnType,
				];
			}
			case 'subtractOp': {
				const returnType = determineReturnType(typeA, typeB);
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(castA.value - castB.value, returnType);
					},
					returnType,
				];
			}
			case 'multiplyOp': {
				const returnType = determineReturnType(typeA, typeB);
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(castA.value * castB.value, returnType);
					},
					returnType,
				];
			}
			case 'divOp': {
				let returnType = determineReturnType(typeA, typeB);
				if (returnType === ValueType.XSINTEGER) {
					returnType = ValueType.XSDECIMAL;
				}
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(castA.value / castB.value, returnType);
					},
					returnType,
				];
			}
			case 'idivOp':
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
						return createAtomicValue(
							Math.trunc(castA.value / castB.value),
							ValueType.XSINTEGER
						);
					},
					ValueType.XSINTEGER,
				];
			case 'modOp': {
				const returnType = determineReturnType(typeA, typeB);

				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(castA.value % castB.value, returnType);
					},
					returnType,
				];
			}
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							yearMonthDurationAdd(castA.value, castB.value),
							ValueType.XSYEARMONTHDURATION
						);
					},
					ValueType.XSYEARMONTHDURATION,
				];
			case 'subtractOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							yearMonthDurationSubtract(castA.value, castB.value),
							ValueType.XSYEARMONTHDURATION
						);
					},
					ValueType.XSYEARMONTHDURATION,
				];
			case 'divOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							yearMonthDurationDivideByYearMonthDuration(castA.value, castB.value),
							ValueType.XSDECIMAL
						);
					},
					ValueType.XSDECIMAL,
				];
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, ValueType.XSNUMERIC)
	) {
		switch (operator) {
			case 'multiplyOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							yearMonthDurationMultiply(castA.value, castB.value),
							ValueType.XSYEARMONTHDURATION
						);
					},
					ValueType.XSYEARMONTHDURATION,
				];
			case 'divOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							yearMonthDurationDivide(castA.value, castB.value),
							ValueType.XSYEARMONTHDURATION
						);
					},
					ValueType.XSYEARMONTHDURATION,
				];
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSNUMERIC) &&
		isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)
	) {
		if (operator === 'multiplyOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationMultiply(castB.value, castA.value),
						ValueType.XSYEARMONTHDURATION
					);
				},
				ValueType.XSYEARMONTHDURATION,
			];
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSDAYTIMEDURATION) &&
		isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							dayTimeDurationAdd(castA.value, castB.value),
							ValueType.XSDAYTIMEDURATION
						);
					},
					ValueType.XSDAYTIMEDURATION,
				];
			case 'subtractOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							dayTimeDurationSubtract(castA.value, castB.value),
							ValueType.XSDAYTIMEDURATION
						);
					},
					ValueType.XSDAYTIMEDURATION,
				];
			case 'divOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							dayTimeDurationDivideByDayTimeDuration(castA.value, castB.value),
							ValueType.XSDECIMAL
						);
					},
					ValueType.XSDECIMAL,
				];
		}
	}
	if (
		isSubtypeOf(typeA, ValueType.XSDAYTIMEDURATION) &&
		isSubtypeOf(typeB, ValueType.XSNUMERIC)
	) {
		switch (operator) {
			case 'multiplyOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							dayTimeDurationMultiply(castA.value, castB.value),
							ValueType.XSDAYTIMEDURATION
						);
					},
					ValueType.XSDAYTIMEDURATION,
				];
			case 'divOp':
				return [
					(a, b) => {
						const { castA, castB } = applyCastFunctions(a, b);
						return createAtomicValue(
							dayTimeDurationDivide(castA.value, castB.value),
							ValueType.XSDAYTIMEDURATION
						);
					},
					ValueType.XSDAYTIMEDURATION,
				];
		}
	}
	if (
		isSubtypeOf(typeA, ValueType.XSNUMERIC) &&
		isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)
	) {
		if (operator === 'multiplyOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationMultiply(castB.value, castA.value),
						ValueType.XSDAYTIMEDURATION
					);
				},
				ValueType.XSDAYTIMEDURATION,
			];
		}
	}

	if (
		(isSubtypeOf(typeA, ValueType.XSDATETIME) && isSubtypeOf(typeB, ValueType.XSDATETIME)) ||
		(isSubtypeOf(typeA, ValueType.XSDATE) && isSubtypeOf(typeB, ValueType.XSDATE)) ||
		(isSubtypeOf(typeA, ValueType.XSTIME) && isSubtypeOf(typeB, ValueType.XSTIME))
	) {
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dateTimeSubtract(castA.value, castB.value),
						ValueType.XSDAYTIMEDURATION
					);
				},
				ValueType.XSDAYTIMEDURATION,
			];
		}

		throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
	}

	if (
		(isSubtypeOf(typeA, ValueType.XSDATETIME) &&
			isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)) ||
		(isSubtypeOf(typeA, ValueType.XSDATETIME) &&
			isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION))
	) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castA.value, castB.value),
						ValueType.XSDATETIME
					);
				},
				ValueType.XSDATETIME,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castA.value, castB.value),
						ValueType.XSDATETIME
					);
				},
				ValueType.XSDATETIME,
			];
		}
	}

	if (
		(isSubtypeOf(typeA, ValueType.XSDATE) &&
			isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)) ||
		(isSubtypeOf(typeA, ValueType.XSDATE) && isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION))
	) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castA.value, castB.value),
						ValueType.XSDATE
					);
				},
				ValueType.XSDATE,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castA.value, castB.value),
						ValueType.XSDATE
					);
				},
				ValueType.XSDATE,
			];
		}
	}

	if (isSubtypeOf(typeA, ValueType.XSTIME) && isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castA.value, castB.value),
						ValueType.XSTIME
					);
				},
				ValueType.XSTIME,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castA.value, castB.value),
						ValueType.XSTIME
					);
				},
				ValueType.XSTIME,
			];
		}
	}

	if (
		(isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION) &&
			isSubtypeOf(typeA, ValueType.XSDATETIME)) ||
		(isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) &&
			isSubtypeOf(typeA, ValueType.XSDATETIME))
	) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castB.value, castA.value),
						ValueType.XSDATETIME
					);
				},
				ValueType.XSDATETIME,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castB.value, castA.value),
						ValueType.XSDATETIME
					);
				},
				ValueType.XSDATETIME,
			];
		}
	}

	if (
		(isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, ValueType.XSDATE)) ||
		(isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION) && isSubtypeOf(typeA, ValueType.XSDATE))
	) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castB.value, castA.value),
						ValueType.XSDATE
					);
				},
				ValueType.XSDATE,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castB.value, castA.value),
						ValueType.XSDATE
					);
				},
				ValueType.XSDATE,
			];
		}
	}

	if (isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, ValueType.XSTIME)) {
		if (operator === 'addOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						addDurationToDateTime(castB.value, castA.value),
						ValueType.XSTIME
					);
				},
				ValueType.XSTIME,
			];
		}
		if (operator === 'subtractOp') {
			return [
				(a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						subtractDurationFromDateTime(castB.value, castA.value),
						ValueType.XSTIME
					);
				},
				ValueType.XSTIME,
			];
		}
	}

	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
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
