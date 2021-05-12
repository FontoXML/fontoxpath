import atomize from '../../dataTypes/atomize';
import castToType from '../../dataTypes/castToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../../dataTypes/Value';
import {
	addDuration as addDurationToDateTime,
	subtract as dateTimeSubtract,
	subtractDuration as subtractDurationFromDateTime,
} from '../../dataTypes/valueTypes/DateTime';
import {
	add as dayTimeDurationAdd,
	divide as dayTimeDurationDivide,
	divideByDayTimeDuration as dayTimeDurationDivideByDayTimeDuration,
	multiply as dayTimeDurationMultiply,
	subtract as dayTimeDurationSubtract,
} from '../../dataTypes/valueTypes/DayTimeDuration';
import {
	add as yearMonthDurationAdd,
	divide as yearMonthDurationDivide,
	divideByYearMonthDuration as yearMonthDurationDivideByYearMonthDuration,
	multiply as yearMonthDurationMultiply,
	subtract as yearMonthDurationSubtract,
} from '../../dataTypes/valueTypes/YearMonthDuration';
import Expression from '../../Expression';

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
	typeB: ValueType,
	retType?: SequenceType
) {
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

	function applyCastFunctions(valueA, valueB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	if (operator === 'addOp' && retType) {
		return (a, b) => {
			const { castA, castB } = applyCastFunctions(a, b);

			return createAtomicValue(castA.value + castB.value, retType.type);
		};
	}

	if (isSubtypeOf(typeA, ValueType.XSNUMERIC) && isSubtypeOf(typeB, ValueType.XSNUMERIC)) {
		switch (operator) {
			case 'addOp': {
				const returnType = determineReturnType(typeA, typeB);
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);

					return createAtomicValue(castA.value + castB.value, returnType);
				};
			}
			case 'subtractOp': {
				const returnType = determineReturnType(typeA, typeB);
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value - castB.value, returnType);
				};
			}
			case 'multiplyOp': {
				const returnType = determineReturnType(typeA, typeB);
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value * castB.value, returnType);
				};
			}
			case 'divOp': {
				let returnType = determineReturnType(typeA, typeB);
				if (returnType === ValueType.XSINTEGER) {
					returnType = ValueType.XSDECIMAL;
				}
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value / castB.value, returnType);
				};
			}
			case 'idivOp':
				return (a, b) => {
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
				};
			case 'modOp': {
				const returnType = determineReturnType(typeA, typeB);

				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(castA.value % castB.value, returnType);
				};
			}
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationAdd(castA.value, castB.value),
						ValueType.XSYEARMONTHDURATION
					);
				};
			case 'subtractOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationSubtract(castA.value, castB.value),
						ValueType.XSYEARMONTHDURATION
					);
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationDivideByYearMonthDuration(castA.value, castB.value),
						ValueType.XSDECIMAL
					);
				};
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, ValueType.XSNUMERIC)
	) {
		switch (operator) {
			case 'multiplyOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationMultiply(castA.value, castB.value),
						ValueType.XSYEARMONTHDURATION
					);
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationDivide(castA.value, castB.value),
						ValueType.XSYEARMONTHDURATION
					);
				};
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSNUMERIC) &&
		isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)
	) {
		if (operator === 'multiplyOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					yearMonthDurationMultiply(castB.value, castA.value),
					ValueType.XSYEARMONTHDURATION
				);
			};
		}
	}

	if (
		isSubtypeOf(typeA, ValueType.XSDAYTIMEDURATION) &&
		isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationAdd(castA.value, castB.value),
						ValueType.XSDAYTIMEDURATION
					);
				};
			case 'subtractOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationSubtract(castA.value, castB.value),
						ValueType.XSDAYTIMEDURATION
					);
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationDivideByDayTimeDuration(castA.value, castB.value),
						ValueType.XSDECIMAL
					);
				};
		}
	}
	if (
		isSubtypeOf(typeA, ValueType.XSDAYTIMEDURATION) &&
		isSubtypeOf(typeB, ValueType.XSNUMERIC)
	) {
		switch (operator) {
			case 'multiplyOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationMultiply(castA.value, castB.value),
						ValueType.XSDAYTIMEDURATION
					);
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationDivide(castA.value, castB.value),
						ValueType.XSDAYTIMEDURATION
					);
				};
		}
	}
	if (
		isSubtypeOf(typeA, ValueType.XSNUMERIC) &&
		isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)
	) {
		if (operator === 'multiplyOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					dayTimeDurationMultiply(castB.value, castA.value),
					ValueType.XSDAYTIMEDURATION
				);
			};
		}
	}

	if (
		(isSubtypeOf(typeA, ValueType.XSDATETIME) && isSubtypeOf(typeB, ValueType.XSDATETIME)) ||
		(isSubtypeOf(typeA, ValueType.XSDATE) && isSubtypeOf(typeB, ValueType.XSDATE)) ||
		(isSubtypeOf(typeA, ValueType.XSTIME) && isSubtypeOf(typeB, ValueType.XSTIME))
	) {
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					dateTimeSubtract(castA.value, castB.value),
					ValueType.XSDAYTIMEDURATION
				);
			};
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
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castA.value, castB.value),
					ValueType.XSDATETIME
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castA.value, castB.value),
					ValueType.XSDATETIME
				);
			};
		}
	}

	if (
		(isSubtypeOf(typeA, ValueType.XSDATE) &&
			isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION)) ||
		(isSubtypeOf(typeA, ValueType.XSDATE) && isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castA.value, castB.value),
					ValueType.XSDATE
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castA.value, castB.value),
					ValueType.XSDATE
				);
			};
		}
	}

	if (isSubtypeOf(typeA, ValueType.XSTIME) && isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION)) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castA.value, castB.value),
					ValueType.XSTIME
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castA.value, castB.value),
					ValueType.XSTIME
				);
			};
		}
	}

	if (
		(isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION) &&
			isSubtypeOf(typeA, ValueType.XSDATETIME)) ||
		(isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) &&
			isSubtypeOf(typeA, ValueType.XSDATETIME))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castB.value, castA.value),
					ValueType.XSDATETIME
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castB.value, castA.value),
					ValueType.XSDATETIME
				);
			};
		}
	}

	if (
		(isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, ValueType.XSDATE)) ||
		(isSubtypeOf(typeB, ValueType.XSYEARMONTHDURATION) && isSubtypeOf(typeA, ValueType.XSDATE))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castB.value, castA.value),
					ValueType.XSDATE
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castB.value, castA.value),
					ValueType.XSDATE
				);
			};
		}
	}

	if (isSubtypeOf(typeB, ValueType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, ValueType.XSTIME)) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					addDurationToDateTime(castB.value, castA.value),
					ValueType.XSTIME
				);
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(
					subtractDurationFromDateTime(castB.value, castA.value),
					ValueType.XSTIME
				);
			};
		}
	}

	throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
}

const operatorsByTypingKey = Object.create(null);

class BinaryOperator extends Expression {
	private _firstValueExpr: Expression;
	private _operator: string;
	private _secondValueExpr: Expression;

	/**
	 * @param  operator         One of addOp, substractOp, multiplyOp, divOp, idivOp, modOp
	 * @param  firstValueExpr   The selector evaluating to the first value to process
	 * @param  secondValueExpr  The selector evaluating to the second value to process
	 */
	constructor(
		operator: string,
		firstValueExpr: Expression,
		secondValueExpr: Expression,
		type: SequenceType
	) {
		super(
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			[firstValueExpr, secondValueExpr],
			{
				canBeStaticallyEvaluated: false,
			},
			false,
			type
		);
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._operator = operator;
	}

	public evaluate(dynamicContext, executionParameters) {
		const firstValueSequence = atomize(
			this._firstValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		);
		return firstValueSequence.mapAll((firstValues) => {
			if (firstValues.length === 0) {
				// Shortcut, if the first part is empty, we can return empty.
				// As per spec, we do not have to evaluate the second part, though we could.
				return sequenceFactory.empty();
			}
			const secondValueSequence = atomize(
				this._secondValueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
				executionParameters
			);
			return secondValueSequence.mapAll((secondValues) => {
				if (secondValues.length === 0) {
					return sequenceFactory.empty();
				}

				if (firstValues.length > 1 || secondValues.length > 1) {
					throw new Error(
						'XPTY0004: the operands of the "' +
							this._operator +
							'" operator should be empty or singleton.'
					);
				}

				const firstValue = firstValues[0];
				const secondValue = secondValues[0];
				// TODO: Find a more errorproof solution, hash collisions can occur here
				const typingKey = `${firstValue.type}~${secondValue.type}~${this._operator}`;
				let prefabOperator = operatorsByTypingKey[typingKey];
				if (!prefabOperator) {
					prefabOperator = operatorsByTypingKey[
						typingKey
					] = generateBinaryOperatorFunction(
						this._operator,
						firstValue.type,
						secondValue.type,
						this.type
					);
				}

				return sequenceFactory.singleton(prefabOperator(firstValue, secondValue));
			});
		});
	}
}

export default BinaryOperator;
