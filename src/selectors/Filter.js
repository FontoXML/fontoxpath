define([
	'./Selector',
	'./dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}    valueSelector
	 * @param  {Selector[]}  filterSelectors
	 */
	function Filter (valueSelector, filterSelectors) {
		var summedSpecificity = filterSelectors.reduce(function (specificity, selector) {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, valueSelector.specificity);
		Selector.call(this, summedSpecificity, valueSelector.expectedResultOrder);

		this._valueSelector = valueSelector;
		this._filterSelectors = filterSelectors;
	}

	Filter.prototype = Object.create(Selector.prototype);
	Filter.prototype.constructor = Filter;

	Filter.prototype.equals = function (otherSelector) {
		return otherSelector instanceof Filter &&
			this._valueSelector.equals(otherSelector._valueSelector) &&
			this._filterSelectors.length === otherSelector._filterSelectors.length &&
			this._filterSelectors.every(function (selector, i) {
				return otherSelector._filterSelectors[i].equals(selector);
			});
	};

	Filter.prototype.getBucket = function () {
		return this._valueSelector.getBucket();
	};

	Filter.prototype.evaluate = function (dynamicContext) {
		var valueSequence = this._valueSelector.evaluate(dynamicContext);
		var filteredValues = this._filterSelectors.reduce(function (intermediateResult, selector) {
				return intermediateResult.filter(function (value, i) {
					var result = selector.evaluate(
							dynamicContext.createScopedContext({
								contextItem: Sequence.singleton(value),
								contextSequence: valueSequence
							}));

					if (result.isEmpty()) {
						return false;
					}

					// The result should be a singleton sequence
					var resultValue = result.value[0];
					if (resultValue.instanceOfType('xs:numeric')) {
						// Remember: XPath is one-based
						return resultValue.value === i + 1;
					}
					return result.getEffectiveBooleanValue();
				});
			}, valueSequence.value);

		return new Sequence(filteredValues);
	};

	return Filter;
});
