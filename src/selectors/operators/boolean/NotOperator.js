define([
	'../../Selector',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue'
], function (
	Selector,
	Sequence,
	BooleanValue
) {
	'use strict';

	/**
	 * Deprecated and only used for 'old' fluent syntax
	 * For selectors, the function not($arg as item()*) is used
	 * @param  {Selector}  selectorToInvert
	 */
	function NotOperator (selectorToInvert) {
		Selector.call(this, selectorToInvert.specificity, Selector.RESULT_ORDER_SORTED);

		this._selectorToInvert = selectorToInvert;
	}

	NotOperator.prototype = Object.create(Selector.prototype);
	NotOperator.prototype.constructor = NotOperator;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NotOperator.prototype.matches = function (node, blueprint) {
		return !this._selectorToInvert.matches(node, blueprint);
	};

	NotOperator.prototype.evaluate = function (dynamicContext) {
		var result = this._selectorToInvert.evaluate(dynamicContext);
		return Sequence.singleton((!result.getEffectiveBooleanValue()) ? BooleanValue.TRUE : BooleanValue.FALSE);
	};

	NotOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof NotOperator &&
			this._selectorToInvert.equals(otherSelector._selectorToInvert);
	};

	NotOperator.prototype.getBucket = function () {
		// Always use the bucket for the targeted node
		return this._selectorToInvert.getBucket();
	};

	return NotOperator;
});
