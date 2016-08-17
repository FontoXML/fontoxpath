define([
	'../Selector',
	'../dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * The 'union' combining selector, or when matching, concats otherwise.
	 * order is undefined.
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function Union (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));

		// If both subSelectors define the same bucket: use that one, else, use no bucket.
		var firstBucket = firstSelector.getBucket(),
			secondBucket = secondSelector.getBucket();

		this._bucket = firstBucket === secondBucket ? firstBucket : null;

		this._subSelectors = [];
		if (firstSelector instanceof Union) {
			this._subSelectors = firstSelector._subSelectors.concat();
		} else {
			this._subSelectors.push(firstSelector);
		}
		if (secondSelector instanceof Union) {
			this._subSelectors = this._subSelectors.concat(secondSelector._subSelectors);
		} else {
			this._subSelectors.push(secondSelector);
		}
	}

	Union.prototype = Object.create(Selector.prototype);
	Union.prototype.constructor = Union;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	Union.prototype.matches = function (node, blueprint) {
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

	Union.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof Union &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	Union.prototype.evaluate = function (nodes, blueprint) {
		return this._subSelectors.reduce(function (accum, selector) {
			return accum.merge(selector.evaluate(nodes, blueprint));
		}, new Sequence());
	};

	Union.prototype.getBucket = function () {
		return this._bucket;
	};

	return Union;
});
