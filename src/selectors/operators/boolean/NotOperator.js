define([
	'fontoxml-blueprints',

	'../../Selector',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue'
], function (
	blueprints,

	Selector,
	Sequence,
	BooleanValue
) {
	'use strict';

	/**
	 * @param  {Selector}  selectorToInvert
	 */
	function NotOperator (selectorToInvert) {
		Selector.call(this, selectorToInvert.specificity);

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

	NotOperator.prototype.evaluate = function (sequence, blueprint) {
		var result = this._selectorToInvert.evaluate(sequence, blueprint);
		return Sequence.singleton(new BooleanValue(!result.getEffectiveBooleanValue()));
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
