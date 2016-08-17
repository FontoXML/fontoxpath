define([
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue',
	'../../Selector'
], function (
	Sequence,
	BooleanValue,
	Selector
	) {
	'use strict';

	/**
	 * The 'and' combining selector
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function AndOperator (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));
		var subSelectors;
		if (firstSelector instanceof AndOperator) {
			subSelectors = firstSelector._subSelectors.concat();
		} else {
			subSelectors = [firstSelector];
		}

		if (secondSelector instanceof AndOperator) {
			subSelectors = subSelectors.concat(secondSelector._subSelectors);
		} else {
			subSelectors.push(secondSelector);
		}

		this._subSelectors = subSelectors;
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

	function isSameSetOfSelectors (selectors1, selectors2) {
		if (selectors1.length !== selectors2.length) {
			return false;
		}

		// Compare arrays of selectors, allowing of variance in ordering only
		var matchedSelectors = new Array(selectors1.length).fill(false);
		return selectors1.every(function (selector1) {
			// See if there is an unmatched value present in the other array
			return selectors2.find(function (selector2, i) {
				if (matchedSelectors[i]) {
					// Already matched
					return false;
				}
				if (selector1.equals(selector2)) {
					// Mark as matched
					matchedSelectors[i] = true;
					return true;
				}
				return false;
			});
		});
	}

	AndOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AndOperator &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	AndOperator.prototype.evaluate = function (sequence, blueprint) {
		var result = this._subSelectors.every(function (subSelector) {
				return subSelector.evaluate(sequence, blueprint).getEffectiveBooleanValue();
			});

		return Sequence.singleton(new BooleanValue(result));
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
