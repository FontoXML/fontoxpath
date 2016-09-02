define([
	'../../functions/isValidArgument',
	'../../Specificity',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue',
	'../../Selector'
], function (
	isValidArgument,
	Specificity,
	Sequence,
	BooleanValue,
	Selector
	) {
	'use strict';

	function InstanceOfOperator (expression, typeTest, multiplicity) {
		Selector.call(
			this,
			expression.specificity,
			Selector.RESULT_ORDER_UNSORTED
		);

		this._expression = expression;
		this._typeTest = typeTest;
		this._multiplicity = multiplicity;
	}

	InstanceOfOperator.prototype = Object.create(Selector.prototype);
	InstanceOfOperator.prototype.constructor = InstanceOfOperator;

	InstanceOfOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return true;
	};

	InstanceOfOperator.prototype.evaluate = function (dynamicContext) {
		var evaluatedExpression = this._expression.evaluate(dynamicContext);

		switch (this._multiplicity) {
			case '?':
				if (!evaluatedExpression.isEmpty() && !evaluatedExpression.isSingleton()) {
					return Sequence.singleton(new BooleanValue(false));
				}
				break;

			case '+':
				if (evaluatedExpression.isEmpty()) {
					return Sequence.singleton(new BooleanValue(false));
				}
				break;

			case '*':
				break;

			default:
				if (!evaluatedExpression.isSingleton()) {
					return Sequence.singleton(new BooleanValue(false));
				}
		}

		var isInstanceOf = evaluatedExpression.value.every(function (argumentItem) {
			return this._typeTest.evaluate(dynamicContext.createScopedContext({ contextItem: argumentItem })).getEffectiveBooleanValue();
		}.bind(this));

		return Sequence.singleton(new BooleanValue(isInstanceOf));
	};

	return InstanceOfOperator;
});
