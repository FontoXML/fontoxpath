define([
	'../Selector'
], function (
	Selector
) {
	'use strict';

	function IfExpression (testExpression, thenExpression, elseExpression) {
		var specificity = testExpression.specificity
			.add(thenExpression.specificity)
			.add(elseExpression.specificity);
		Selector.call(
			this,
			specificity,
			thenExpression.expectedResultOrder === elseExpression.expectedResultOrder ?
				thenExpression.expectedResultOrder : this.RESULT_ORDER_UNSORTED);

		this._testExpression = testExpression;
		this._thenExpression = thenExpression;
		this._elseExpression = elseExpression;
	}

	IfExpression.prototype = Object.create(Selector.prototype);
	IfExpression.prototype.constructor = IfExpression;

	IfExpression.prototype.equals = function (otherSelector) {
		if (otherSelector === this) {
			return true;
		}

		return otherSelector instanceof IfExpression &&
			this._testExpression.equals(otherSelector._testExpression) &&
			this._thenExpression.equals(otherSelector._thenExpression) &&
			this._elseExpression.equals(otherSelector._elseExpression);
	};

	IfExpression.prototype.evaluate = function (dynamicContext) {
		if (this._testExpression.evaluate(dynamicContext).getEffectiveBooleanValue()) {
			return this._thenExpression.evaluate(dynamicContext);
		}
		return this._elseExpression.evaluate(dynamicContext);
	};

	return IfExpression;
});
