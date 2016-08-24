define([
	'../../Selector',
	'../../Specificity',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue'
], function (
	Selector,
	Specificity,
	Sequence,
	BooleanValue
) {
	'use strict';

	/**
	 * The 'or' combining selector
	 * @param  {Selector[]}  selectors
	 */
	function OrOperator (selectors) {
		Selector.call(this, selectors.reduce(function (maxSpecificity, selector) {
			if (maxSpecificity.compareTo(selector.specificity) > 0) {
				return maxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({})));

		// If all subSelectors define the same bucket: use that one, else, use no bucket.
		this._bucket = selectors.reduce(function (bucket, selector) {
			if (bucket === undefined) {
				return selector.getBucket();
			}
			if (bucket === null) {
				return null;
			}

			if (bucket !== selector.getBucket()) {
				return null;
			}

			return bucket;
		}, undefined);

		this._subSelectors = selectors;
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

	OrOperator.prototype.evaluate = function (dynamicContext) {
		var result = this._subSelectors.some(function (subSelector) {
				return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
			});

		return Sequence.singleton(new BooleanValue(result));
	};

	OrOperator.prototype.getBucket = function () {
		return this._bucket;
	};

	return OrOperator;
});
