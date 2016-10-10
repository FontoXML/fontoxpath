define([
	'../../isSameSetOfSelectors',
	'../../Selector',
	'../../Specificity',
	'../../dataTypes/Sequence',
	'../../dataTypes/BooleanValue'
], function (
	isSameSetOfSelectors,
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
		Selector.call(
			this,
			selectors.reduce(function (maxSpecificity, selector) {
				if (maxSpecificity.compareTo(selector.specificity) > 0) {
					return maxSpecificity;
				}
				return selector.specificity;
			}, new Specificity({})),
			Selector.RESULT_ORDER_SORTED);

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

		return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
	};

	OrOperator.prototype.getBucket = function () {
		return this._bucket;
	};

	return OrOperator;
});
