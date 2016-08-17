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
	 * The 'or' combining selector, union when evaluating
	 * @param  {Selector}  firstSelector
	 * @param  {Selector}  secondSelector
	 */
	function OrOperator (firstSelector, secondSelector) {
		Selector.call(this, firstSelector.specificity.add(secondSelector.specificity));

		// If both subSelectors define the same bucket: use that one, else, use no bucket.
		var firstBucket = firstSelector.getBucket(),
			secondBucket = secondSelector.getBucket();

		this._bucket = firstBucket === secondBucket ? firstBucket : null;

		this._subSelectors = [];
		if (firstSelector instanceof OrOperator) {
			this._subSelectors = firstSelector._subSelectors.concat();
		} else {
			this._subSelectors.push(firstSelector);
		}
		if (secondSelector instanceof OrOperator) {
			this._subSelectors = this._subSelectors.concat(secondSelector._subSelectors);
		} else {
			this._subSelectors.push(secondSelector);
		}
	}

	OrOperator.prototype = Object.create(Selector.prototype);
	OrOperator.prototype.constructor = OrOperator;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	OrOperator.prototype.matches = function (node, blueprint) {
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

	OrOperator.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof OrOperator &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	};

	OrOperator.prototype.evaluate = function (sequence, blueprint) {
		var result = this._subSelectors.some(function (subSelector) {
				return subSelector.evaluate(sequence, blueprint).getEffectiveBooleanValue();
			});

		return Sequence.singleton(new BooleanValue(result));
	};

	OrOperator.prototype.getBucket = function () {
		return this._bucket;
	};

	return OrOperator;
});
