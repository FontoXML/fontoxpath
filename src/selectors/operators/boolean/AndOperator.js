define([
	'../../isSameSetOfSelectors',
	'../../Specificity',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue',
	'../../Selector'
], function (
	isSameSetOfSelectors,
	Specificity,
	Sequence,
	BooleanValue,
	Selector
) {
	'use strict';

	/**
	 * The 'and' combining selector
	 * @param  {Selector[]}  selectors
	 */
	function AndOperator (selectors) {
		Selector.call(
			this,
			selectors.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			Selector.RESULT_ORDER_SORTED);
		this._subSelectors = selectors;
	}

	AndOperator.prototype = Object.create(Selector.prototype);
	AndOperator.prototype.constructor = AndOperator;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AndOperator.prototype.matches = function (node, blueprint) {
		return this._subSelectors.every(function (subSelector) {
			return subSelector.matches(node, blueprint);
		});
	};

	AndOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AndOperator &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	AndOperator.prototype.evaluate = function (dynamicContext) {
		var result = this._subSelectors.every(function (subSelector) {
				return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
			});

		return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
	};

	AndOperator.prototype.getBucket = function () {
		// Any bucket of our subselectors should do, and is preferable to no bucket
		for (var i = 0, l = this._subSelectors.length; i < l; ++i) {
			var bucket = this._subSelectors[i].getBucket();
			if (bucket) {
				return bucket;
			}
		}
		return null;
	};

	return AndOperator;
});
