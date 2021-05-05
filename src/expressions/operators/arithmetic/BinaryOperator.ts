import atomize from '../../dataTypes/atomize';
import castToType from '../../dataTypes/castToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { BaseType, ValueType, SequenceType, valueTypeHash } from '../../dataTypes/Value';
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

function determineReturnType(typeA: BaseType, typeB: BaseType): ValueType {
	if (isSubtypeOf(typeA, BaseType.XSINTEGER) && isSubtypeOf(typeB, BaseType.XSINTEGER)) {
		return { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE };
	}
	if (isSubtypeOf(typeA, BaseType.XSDECIMAL) && isSubtypeOf(typeB, BaseType.XSDECIMAL)) {
		return { kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE };
	}
	if (isSubtypeOf(typeA, BaseType.XSFLOAT) && isSubtypeOf(typeB, BaseType.XSFLOAT)) {
		return { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE };
	}
	return { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE };
}

function generateBinaryOperatorFunction(operator, typeA: BaseType, typeB: BaseType) {
	let castFunctionForValueA = null;
	let castFunctionForValueB = null;

	if (isSubtypeOf(typeA, BaseType.XSUNTYPEDATOMIC)) {
		castFunctionForValueA = (value) => castToType(value, BaseType.XSDOUBLE);
		typeA = BaseType.XSDOUBLE;
	}
	if (isSubtypeOf(typeB, BaseType.XSUNTYPEDATOMIC)) {
		castFunctionForValueB = (value) => castToType(value, BaseType.XSDOUBLE);
		typeB = BaseType.XSDOUBLE;
	}

	function applyCastFunctions(valueA, valueB) {
		return {
			castA: castFunctionForValueA ? castFunctionForValueA(valueA) : valueA,
			castB: castFunctionForValueB ? castFunctionForValueB(valueB) : valueB,
		};
	}

	if (isSubtypeOf(typeA, BaseType.XSNUMERIC) && isSubtypeOf(typeB, BaseType.XSNUMERIC)) {
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
				if (returnType.kind === BaseType.XSINTEGER) {
					returnType = { kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE };
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
						return createAtomicValue(0, {
							kind: BaseType.XSINTEGER,
							seqType: SequenceType.EXACTLY_ONE,
						});
					}
					return createAtomicValue(Math.trunc(castA.value / castB.value), {
						kind: BaseType.XSINTEGER,
						seqType: SequenceType.EXACTLY_ONE,
					});
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
		isSubtypeOf(typeA, BaseType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationAdd(castA.value, castB.value), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'subtractOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationSubtract(castA.value, castB.value), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						yearMonthDurationDivideByYearMonthDuration(castA.value, castB.value),
						{
							kind: BaseType.XSDECIMAL,
							seqType: SequenceType.EXACTLY_ONE,
						}
					);
				};
		}
	}

	if (
		isSubtypeOf(typeA, BaseType.XSYEARMONTHDURATION) &&
		isSubtypeOf(typeB, BaseType.XSNUMERIC)
	) {
		switch (operator) {
			case 'multiplyOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationMultiply(castA.value, castB.value), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(yearMonthDurationDivide(castA.value, castB.value), {
						kind: BaseType.XSYEARMONTHDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
		}
	}

	if (
		isSubtypeOf(typeA, BaseType.XSNUMERIC) &&
		isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION)
	) {
		if (operator === 'multiplyOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(yearMonthDurationMultiply(castB.value, castA.value), {
					kind: BaseType.XSYEARMONTHDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (
		isSubtypeOf(typeA, BaseType.XSDAYTIMEDURATION) &&
		isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION)
	) {
		switch (operator) {
			case 'addOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationAdd(castA.value, castB.value), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'subtractOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationSubtract(castA.value, castB.value), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(
						dayTimeDurationDivideByDayTimeDuration(castA.value, castB.value),
						{ kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }
					);
				};
		}
	}
	if (isSubtypeOf(typeA, BaseType.XSDAYTIMEDURATION) && isSubtypeOf(typeB, BaseType.XSNUMERIC)) {
		switch (operator) {
			case 'multiplyOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationMultiply(castA.value, castB.value), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
			case 'divOp':
				return (a, b) => {
					const { castA, castB } = applyCastFunctions(a, b);
					return createAtomicValue(dayTimeDurationDivide(castA.value, castB.value), {
						kind: BaseType.XSDAYTIMEDURATION,
						seqType: SequenceType.EXACTLY_ONE,
					});
				};
		}
	}
	if (isSubtypeOf(typeA, BaseType.XSNUMERIC) && isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION)) {
		if (operator === 'multiplyOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(dayTimeDurationMultiply(castB.value, castA.value), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (
		(isSubtypeOf(typeA, BaseType.XSDATETIME) && isSubtypeOf(typeB, BaseType.XSDATETIME)) ||
		(isSubtypeOf(typeA, BaseType.XSDATE) && isSubtypeOf(typeB, BaseType.XSDATE)) ||
		(isSubtypeOf(typeA, BaseType.XSTIME) && isSubtypeOf(typeB, BaseType.XSTIME))
	) {
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(dateTimeSubtract(castA.value, castB.value), {
					kind: BaseType.XSDAYTIMEDURATION,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}

		throw new Error(`XPTY0004: ${operator} not available for types ${typeA} and ${typeB}`);
	}

	if (
		(isSubtypeOf(typeA, BaseType.XSDATETIME) &&
			isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION)) ||
		(isSubtypeOf(typeA, BaseType.XSDATETIME) && isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (
		(isSubtypeOf(typeA, BaseType.XSDATE) && isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION)) ||
		(isSubtypeOf(typeA, BaseType.XSDATE) && isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (isSubtypeOf(typeA, BaseType.XSTIME) && isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION)) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castA.value, castB.value), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castA.value, castB.value), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (
		(isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION) &&
			isSubtypeOf(typeA, BaseType.XSDATETIME)) ||
		(isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, BaseType.XSDATETIME))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), {
					kind: BaseType.XSDATETIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (
		(isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, BaseType.XSDATE)) ||
		(isSubtypeOf(typeB, BaseType.XSYEARMONTHDURATION) && isSubtypeOf(typeA, BaseType.XSDATE))
	) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), {
					kind: BaseType.XSDATE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
	}

	if (isSubtypeOf(typeB, BaseType.XSDAYTIMEDURATION) && isSubtypeOf(typeA, BaseType.XSTIME)) {
		if (operator === 'addOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(addDurationToDateTime(castB.value, castA.value), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
			};
		}
		if (operator === 'subtractOp') {
			return (a, b) => {
				const { castA, castB } = applyCastFunctions(a, b);
				return createAtomicValue(subtractDurationFromDateTime(castB.value, castA.value), {
					kind: BaseType.XSTIME,
					seqType: SequenceType.EXACTLY_ONE,
				});
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
	constructor(operator: string, firstValueExpr: Expression, secondValueExpr: Expression) {
		super(
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			[firstValueExpr, secondValueExpr],
			{
				canBeStaticallyEvaluated: false,
			}
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
				const typingKey = `${valueTypeHash(firstValue.type)}~${valueTypeHash(
					secondValue.type
				)}~${this._operator}`;
				let prefabOperator = operatorsByTypingKey[typingKey];
				if (!prefabOperator) {
					prefabOperator = operatorsByTypingKey[
						typingKey
					] = generateBinaryOperatorFunction(
						this._operator,
						firstValue.type.kind,
						secondValue.type.kind
					);
				}

				return sequenceFactory.singleton(prefabOperator(firstValue, secondValue));
			});
		});
	}
}

export default BinaryOperator;
