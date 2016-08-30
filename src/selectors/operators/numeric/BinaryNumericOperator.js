define([
	'../../dataTypes/Sequence',
	'../../dataTypes/DoubleValue',
	'../../dataTypes/DecimalValue',
	'../../dataTypes/IntegerValue',
	'../../dataTypes/UntypedAtomicValue',
	'../../Selector',

], function (
	Sequence,
	DoubleValue,
	DecimalValue,
	IntegerValue,
	UntypedAtomicValue,
	Selector
) {
	'use strict';

	/**
	 * @param  {string}    kind             One of +, -, *, div, idiv, mod
	 * @param  {Selector}  firstValueExpr   The selector evaluating to the first value to process
	 * @param  {Selector}  secondValueExpr  The selector evaluating to the second value to process
	 */
	function BinaryNumericOperator (kind, firstValueExpr, secondValueExpr) {
		Selector.call(
			this,
			firstValueExpr.specificity.add(secondValueExpr.specificity),
			Selector.RESULT_ORDER_SORTED);
		this._firstValueExpr = firstValueExpr;
		this._secondValueExpr = secondValueExpr;

		this._kind = kind;
	}

	BinaryNumericOperator.prototype = Object.create(Selector.prototype);
	BinaryNumericOperator.prototype.constructor = BinaryNumericOperator;

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
				return Math.abs(a / b);
			case 'mod':
				return a % b;
		}
	}

	BinaryNumericOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof BinaryNumericOperator &&
			this._kind === otherSelector._kind &&
			this._firstValueExpr.equals(otherSelector._firstValueExpr),
			this._secondValueExpr.equals(otherSelector._secondValueExpr);
	};

	BinaryNumericOperator.prototype.evaluate = function (dynamicContext) {
		var firstValueSequence = this._firstValueExpr.evaluate(dynamicContext).atomize();
		if (firstValueSequence.isEmpty()) {
			// Shortcut, if the first part is empty, we can return empty.
			// As per spec, we do not have to evaluate the second part, though we could.
			return firstValueSequence;
		}
		var secondValueSequence = this._secondValueExpr.evaluate(dynamicContext);
		if (secondValueSequence.isEmpty()) {
			return secondValueSequence;
		}

		if (!firstValueSequence.isSingleton() || !secondValueSequence.isSingleton()) {
			throw new Error('XPTY0004: the operands of the "' + this._kind + '" operator should be of type xs:numeric?.');
		}

		// Cast both to doubles, if they are xs:untypedAtomic
		var firstValue = firstValueSequence.value[0],
			secondValue = secondValueSequence.value[0];

		if (firstValue instanceof UntypedAtomicValue) {
			firstValue = DoubleValue.cast(firstValue);
		}

		if (secondValue instanceof UntypedAtomicValue) {
			secondValue = DoubleValue.cast(secondValue);
		}

		var result = executeOperator(this._kind, firstValue.value, secondValue.value),
			typedResult;
		// Override for types
		if (this._kind === 'div') {
			typedResult = new DecimalValue(result);
		} else if (this._kind === 'idiv') {
			typedResult = new IntegerValue(result);
		} else {
			// For now, always return a decimal, it's all the same in JavaScript
			typedResult = new DecimalValue(result);
		}
		return Sequence.singleton(typedResult);
	};

	return BinaryNumericOperator;
});
