define([
	'../Selector',
	'../Specificity',
	'../dataTypes/Sequence'
], function (
	Selector,
	Specificity,
	Sequence
) {
	'use strict';

	/**
	 * The Sequence selector evaluates its operands and returns them as a single sequence
	 *
	 * @param  {Selector[]}  selectors
	 */
	function SequenceOperator (selectors) {
		Selector.call(this, selectors.reduce(function (specificity, selector) {
			return specificity.add(selector.specificity);
		}, new Specificity({})));
		this._selectors = selectors;
	}

	SequenceOperator.prototype = Object.create(Selector.prototype);
	SequenceOperator.prototype.constructor =SequenceOperator;

	SequenceOperator.prototype.evaluate = function (dynamicContext) {
		return this._selectors.reduce(function (accum, selector) {
			return accum.merge(selector.evaluate(dynamicContext));
		}, new Sequence());
	};

	return SequenceOperator;
});
