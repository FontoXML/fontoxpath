import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import castToType from '../../dataTypes/castToType';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';

import {
	subtract as dateTimeSubtract,
	add as dateTimeAdd,
	addDuration as addDurationToDateTime,
	subtractDuration as subtractDurationFromDateTime
} from '../../dataTypes/valueTypes/DateTime';

import {
	add as yearMonthDurationAdd,
	subtract as yearMonthDurationSubtract,
	multiply as yearMonthDurationMultiply,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration
} from '../../dataTypes/valueTypes/YearMonthDuration';
import {
	add as dayTimeDurationAdd,
	subtract as dayTimeDurationSubtract,
	multiply as dayTimeDurationMultiply,
	divide as dayTimeDurationDivide,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration
} from '../../dataTypes/valueTypes/DayTimeDuration';

function generateBinaryOperatorFunction (operator, typeA, typeB) {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, 'xs:untypedAtomic')) {
		castFunctionForValueA = value => castToType(value, 'xs:double');
		typeA = 'xs:double';
	}
	if (isSubtypeOf(typeB, 'xs:untypedAtomic')) {
		castFunctionForValueB = value => castToType(value, 'xs:double');
		typeB = 'xs:double';
	}

	function applyCastFunctions (valueA, valueB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB
		};
	}

	if (isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:numeric')) {
		switch (operator) {
			case '+':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value + castB.value, 'xs:decimal');
				};
			case '-':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value - castB.value, 'xs:decimal');
				};
			case '*':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value * castB.value, 'xs:decimal');
				};
			case 'div':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value / castB.value, 'xs:decimal');
				};
			case 'idiv':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					if (castB.value === 0 || castB.value === -0) {
						throw new Error('FOAR0001: Devisor of idiv operator cannot be (-)0');
					}
					if (Number.isNaN(castA.value) || Number.isNaN(castB.value) || !Number.isFinite(castA.value)) {
						throw new Error('FOAR0002: One of the operands of idiv is NaN or the first operand is (-)INF');
					}
					if (Number.isFinite(castA.value) && !Number.isFinite(castB.value)) {
						return createAtomicValue(0, 'xs:integer');
					}
					return createAtomicValue(Math.trunc(castA.value / castB.value), 'xs:integer');
				};
			case 'mod':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value % castB.value, 'xs:decimal');
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:yearMonthDuration') && isSubtypeOf(typeB, 'xs:yearMonthDuration')) {
		switch (operator) {
			case '+':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationAdd(castA.value, castB.value), 'xs:yearMonthDuration');
				};
			case '-':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationSubtract(castA.value, castB.value), 'xs:yearMonthDuration');
				};
			case 'div':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationDivideByYearMonthDuration(castA.value, castB.value), 'xs:double');
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:yearMonthDuration') && isSubtypeOf(typeB, 'xs:numeric')) {
		switch (operator) {
			case '*':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationMultiply(castA.value, castB.value), 'xs:yearMonthDuration');
				};
			case 'div':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationDivide(castA.value, castB.value), 'xs:yearMonthDuration');
				};
		}
	}

	if (isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:yearMonthDuration')) {
		if (operator === '*') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(yearMonthDurationMultiply(castB.value, castA.value), 'xs:yearMonthDuration');
			};
		}
	}

	if (isSubtypeOf(typeA, 'xs:dayTimeDuration') && isSubtypeOf(typeB, 'xs:dayTimeDuration')) {
		switch (operator) {
			case '+':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationAdd(castA.value, castB.value), 'xs:dayTimeDuration');
				};
			case '-':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationSubtract(castA.value, castB.value), 'xs:dayTimeDuration');
				};
			case 'div':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationDivideByDayTimeDuration(castA.value, castB.value), 'xs:decimal');
				};
		}
	}
	if (isSubtypeOf(typeA, 'xs:dayTimeDuration') && isSubtypeOf(typeB, 'xs:numeric')) {
		switch (operator) {
			case '*':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationMultiply(castA.value, castB.value), 'xs:dayTimeDuration');
				};
			case 'div':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationDivide(castA.value, castB.value), 'xs:dayTimeDuration');
				};
		}
	}
	if (isSubtypeOf(typeA, 'xs:numeric') && isSubtypeOf(typeB, 'xs:dayTimeDuration')) {
		if (operator === '*') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(dayTimeDurationMultiply(castB.value, castA.value), 'xs:dayTimeDuration');
			};
		}
	}

	if ((isSubtypeOf(typeA, 'xs:dateTime') && isSubtypeOf(typeB, 'xs:dateTime')) ||
		(isSubtypeOf(typeA, 'xs:date') && isSubtypeOf(typeB, 'xs:date')) ||
		(isSubtypeOf(typeA, 'xs:time') && isSubtypeOf(typeB, 'xs:time'))) {
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(dateTimeSubtract(castA.value, castB.value), 'xs:dayTimeDuration');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(dateTimeAdd(castA.value, castB.value), 'xs:dayTimeDuration');
			};
		}

		throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
	}

	if ((isSubtypeOf(typeA, 'xs:dateTime') && isSubtypeOf(typeB, 'xs:yearMonthDuration')) ||
		(isSubtypeOf(typeA, 'xs:dateTime') && isSubtypeOf(typeB, 'xs:dayTimeDuration'))) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), 'xs:dateTime');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), 'xs:dateTime');
			};
		}
	}

	if ((isSubtypeOf(typeA, 'xs:date') && isSubtypeOf(typeB, 'xs:yearMonthDuration')) ||
		(isSubtypeOf(typeA, 'xs:date') && isSubtypeOf(typeB, 'xs:dayTimeDuration'))) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), 'xs:date');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), 'xs:date');
			};
		}
	}

	if (isSubtypeOf(typeA, 'xs:time') && isSubtypeOf(typeB, 'xs:dayTimeDuration')) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), 'xs:time');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), 'xs:time');
			};
		}
	}

	if ((isSubtypeOf(typeB, 'xs:yearMonthDuration') && isSubtypeOf(typeA, 'xs:dateTime')) ||
		(isSubtypeOf(typeB, 'xs:dayTimeDuration') && isSubtypeOf(typeA, 'xs:dateTime'))) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), 'xs:dateTime');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), 'xs:dateTime');
			};
		}

	}

	if ((isSubtypeOf(typeB, 'xs:dayTimeDuration') && isSubtypeOf(typeA, 'xs:date')) ||
		((isSubtypeOf(typeB, 'xs:yearMonthDuration') && isSubtypeOf(typeA, 'xs:date')))) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), 'xs:date');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), 'xs:date');
			};
		}
	}

	if (isSubtypeOf(typeB, 'xs:dayTimeDuration') && isSubtypeOf(typeA, 'xs:time')) {
		if (operator === '+') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), 'xs:time');
			};
		}
		if (operator === '-') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), 'xs:time');
			};
		}
	}

	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}

const operatorsByTypingKey = Object.create(null);

/**
 * @extends {Selector}
 */
class BinaryOperator extends Selector {
	/**
	 * @param  {string}    operator         One of +, -, *, div, idiv, mod
	 * @param  {Selector}  firstValueExpr   The selector evaluating to the first value to process
	 * @param  {Selector}  secondValueExpr  The selector evaluating to the second value to process
	 */
	constructor (operator, firstValueExpr, secondValueExpr) {
		super(
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			[firstValueExpr, secondValueExpr],
			{
				canBeStaticallyEvaluated: false
			});
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._operator = operator;
	}

	evaluate (dynamicContext) {
		const firstValueSequence = this._firstValueExpr.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext);
		return firstValueSequence.mapAll(
			firstValues => {
				if (firstValues.length === 0) {
					// Shortcut, if the first part is empty, we can return empty.
					// As per spec, we do not have to evaluate the second part, though we could.
					return Sequence.empty();
				}
				const secondValueSequence = this._secondValueExpr.evaluateMaybeStatically(dynamicContext).atomize(dynamicContext);
				return secondValueSequence.mapAll(
					secondValues => {
						if (secondValues.length === 0) {
							return Sequence.empty();
						}

						if (firstValues.length > 1 || secondValues.length > 1) {
							throw new Error('XPTY0004: the operands of the "' + this._operator + '" operator should be empty or singleton.');
						}

						const firstValue = firstValues[0];
						const secondValue = secondValues[0];
						const typingKey = `${firstValue.type}~${secondValue.type}~${this._operator}`;
						let prefabOperator = operatorsByTypingKey[typingKey];
						if (!prefabOperator) {
							prefabOperator = operatorsByTypingKey[typingKey] = generateBinaryOperatorFunction(
								this._operator,
								firstValue.type,
								secondValue.type);
						}

						return Sequence.singleton(prefabOperator(firstValue, secondValue));
					});
			});
	}
}

export default BinaryOperator;
