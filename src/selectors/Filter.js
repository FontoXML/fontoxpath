define([
	'./Selector',
	'./Specificity',
	'./dataTypes/Sequence',
	'./dataTypes/NumericValue'
], function (
	Selector,
	Specificity,
	Sequence,
	NumericValue
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

	Filter.prototype.evaluate = function (dynamicContext) {
		var	blueprint = dynamicContext.blueprint;
		var valueSequence = this._valueSelector.evaluate(dynamicContext);
		var filteredValues = this._filterSelectors.reduce(function (intermediateResult, selector) {
				return intermediateResult.filter(function (value, i) {
					var result = selector.evaluate({
							contextItem: Sequence.singleton(value),
							blueprint: blueprint,
							contextSequence: valueSequence
						});

					// The result should be a singleton sequence
					var resultValue = result.value[0];
					if (resultValue instanceof NumericValue) {
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
