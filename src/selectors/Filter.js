define([
	'./Selector',
	'./Specificity',
	'./dataTypes/Sequence'
], function (
	Selector,
	Specificity,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}    valueSelector
	 * @param  {Selector[]}  filterSelectors
	 */
	function Filter (valueSelector, filterSelectors) {
		Selector.call(this, filterSelectors.reduce(function (specificity, selector) {
			// Implicit AND, so sum
			return specificity.add(selector.specificity);
		}, new Specificity({})));

		this._valueSelector = valueSelector;
		this._filterSelectors = filterSelectors;
	}

	Filter.prototype = Object.create(Selector.prototype);
	Filter.prototype.constructor = Filter;

	Filter.prototype.equals = function (otherSelector) {
		return otherSelector instanceof Filter &&
			this._filterSelectors.length === otherSelector._filterSelectors.length &&
			this._filterSelectors.every(function (selector, i) {
				return otherSelector._filterSelectors[i].equals(selector);
			});
	};

	Filter.prototype.evaluate = function (sequence, blueprint) {
		var valueSequence = this._valueSelector.evaluate(sequence, blueprint);
		var filteredValues = this._filterSelectors.reduce(function (intermediateResult, selector) {
			return intermediateResult.filter(function (value) {
					var result = selector.evaluate(Sequence.singleton(value), blueprint);
					return result.getEffectiveBooleanValue();
				});
		}, valueSequence.value);

		return new Sequence(filteredValues);
	};

	return Filter;
});
