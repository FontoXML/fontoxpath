define([
	'./Selector'
], function (
	Selector
) {
	'use strict';

	/**
	 * The 'or' combining selector
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function OrCombiningSelector (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));

		// If both subSelectors define the same bucket: use that one, else, use no bucket.
		var firstBucket = firstSelector.getBucket(),
			secondBucket = secondSelector.getBucket();
		if (firstBucket && secondBucket && firstBucket !== secondBucket) {
			throw new Error('It is not allowed to make an or over selectors with different buckets');
		}
		this._bucket = firstBucket === secondBucket ? firstBucket : null;

		this._subSelectors = [];
		if (firstSelector instanceof OrCombiningSelector) {
			this._subSelectors = firstSelector._subSelectors.concat();
		} else {
			this._subSelectors.push(firstSelector);
		}
		if (secondSelector instanceof OrCombiningSelector) {
			this._subSelectors = this._subSelectors.concat(secondSelector._subSelectors);
		} else {
			this._subSelectors.push(secondSelector);
		}
	}

	OrCombiningSelector.prototype = Object.create(Selector.prototype);
	OrCombiningSelector.prototype.constructor = OrCombiningSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	OrCombiningSelector.prototype.matches = function (node, blueprint) {
		return this._subSelectors.some(function (subSelector) {
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

	OrCombiningSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof OrCombiningSelector &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	OrCombiningSelector.prototype.getBucket = function () {
		return this._bucket;
	};

	return OrCombiningSelector;
});
