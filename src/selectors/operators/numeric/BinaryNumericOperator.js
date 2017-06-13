import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import castToType from '../../dataTypes/castToType';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';

import YearMonthDuration from '../../dataTypes/valueTypes/YearMonthDuration';
import DayTimeDuration from '../../dataTypes/valueTypes/DayTimeDuration';

function executeOperator (kind, a, b) {
	switch (kind) {
		case '+':
			return a + b;
		case '-':
			return a - b;
		case '*':
			return a * b;
		case 'div':
			return a / b;
		case 'idiv':
			return Math.trunc(a / b);
		case 'mod':
			return a % b;
	}
}

/**
 * @extends {Selector}
 */
class BinaryNumericOperator extends Selector {
	/**
	 * @param  {string}    kind             One of +, -, *, div, idiv, mod
	 * @param  {Selector}  firstValueExpr   The selector evaluating to the first value to process
	 * @param  {Selector}  secondValueExpr  The selector evaluating to the second value to process
	 */
	constructor (kind, firstValueExpr, secondValueExpr) {
		super(firstValueExpr.specificity.add(secondValueExpr.specificity), {
			canBeStaticallyEvaluated: false
		});
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._kind = kind;
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
							throw new Error('XPTY0004: the operands of the "' + this._kind + '" operator should be of type xs:numeric?.');
						}

						// Cast both to doubles, if they are xs:untypedAtomic
						let firstValue = firstValues[0];
						let secondValue = secondValues[0];

						if (isSubtypeOf(firstValue.type, 'xs:untypedAtomic')) {
							firstValue = castToType(firstValue, 'xs:double');
						}

						if (isSubtypeOf(secondValue.type, 'xs:untypedAtomic')) {
							secondValue = castToType(secondValue, 'xs:double');
						}

						if (isSubtypeOf(firstValue.type, 'xs:yearMonthDuration') &&
							isSubtypeOf(secondValue.type, 'xs:yearMonthDuration')) {
							switch (this._kind) {
								case '+':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.add(firstValue.value, secondValue.value), 'xs:yearMonthDuration'));
								case '-':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.subtract(firstValue.value, secondValue.value), 'xs:yearMonthDuration'));
								case 'div':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.divideByYearMonthDuration(firstValue.value, secondValue.value), 'xs:double'));
							}
						}
						if (isSubtypeOf(firstValue.type, 'xs:yearMonthDuration') &&
							isSubtypeOf(secondValue.type, 'xs:numeric')) {
							switch (this._kind) {
								case '*':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.multiply(firstValue.value, secondValue.value), 'xs:yearMonthDuration'));
								case 'div':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.divide(firstValue.value, secondValue.value), 'xs:yearMonthDuration'));
							}
						}
						if (isSubtypeOf(firstValue.type, 'xs:numeric') &&
							isSubtypeOf(secondValue.type, 'xs:yearMonthDuration')) {
							switch (this._kind) {
								case '*':
									return Sequence.singleton(createAtomicValue(YearMonthDuration.multiply(secondValue.value, firstValue.value), 'xs:yearMonthDuration'));
							}
						}

						if (isSubtypeOf(firstValue.type, 'xs:dayTimeDuration') &&
							isSubtypeOf(secondValue.type, 'xs:dayTimeDuration')) {
							switch (this._kind) {
								case '+':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.add(firstValue.value, secondValue.value), 'xs:dayTimeDuration'));
								case '-':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.subtract(firstValue.value, secondValue.value), 'xs:dayTimeDuration'));
								case 'div':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.divideByDayTimeDuration(firstValue.value, secondValue.value), 'xs:decimal'));
							}
						}
						if (isSubtypeOf(firstValue.type, 'xs:dayTimeDuration') &&
							isSubtypeOf(secondValue.type, 'xs:numeric')) {
							switch (this._kind) {
								case '*':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.multiply(firstValue.value, secondValue.value), 'xs:dayTimeDuration'));
								case 'div':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.divide(firstValue.value, secondValue.value), 'xs:dayTimeDuration'));
							}
						}
						if (isSubtypeOf(firstValue.type, 'xs:numeric') &&
							isSubtypeOf(secondValue.type, 'xs:dayTimeDuration')) {
							switch (this._kind) {
								case '*':
									return Sequence.singleton(createAtomicValue(DayTimeDuration.multiply(secondValue.value, firstValue.value), 'xs:dayTimeDuration'));
							}
						}

						if (isSubtypeOf(firstValue.type, 'xs:date') || isSubtypeOf(secondValue.type, 'xs:date') ||
							isSubtypeOf(firstValue.type, 'xs:time') || isSubtypeOf(secondValue.type, 'xs:time') ||
							isSubtypeOf(firstValue.type, 'xs:dateTime') || isSubtypeOf(secondValue.type, 'xs:dateTime')) {
							throw new Error('Not implemented: arithmetic on dates and times');
						}


						if (!isSubtypeOf(firstValue.type, 'xs:numeric') || !isSubtypeOf(secondValue.type, 'xs:numeric')) {
							throw new Error('XPTY0004: the operands of the "' + this._kind + '" operator should be of type xs:numeric?.');
						}

						const result = executeOperator(this._kind, firstValue.value, secondValue.value);
						let typedResult;
						// Override for types
						if (this._kind === 'div') {
							typedResult = createAtomicValue(result, 'xs:decimal');
						}
						else if (this._kind === 'idiv') {
							typedResult = createAtomicValue(result, 'xs:integer');
						}
						else {
							// For now, always return a decimal, it's all the same in JavaScript
							typedResult = createAtomicValue(result, 'xs:decimal');
						}
						return Sequence.singleton(typedResult);
					});
			});
	}
}

export default BinaryNumericOperator;
