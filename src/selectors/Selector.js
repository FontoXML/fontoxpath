define([
	'./DynamicContext',
	'./dataTypes/Sequence',
	'./dataTypes/NodeValue'
], function (
	DynamicContext,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * @param  {Specificity}  specificity
	 */
	function Selector (specificity) {
		/**
		 * @type  {Specificity}
		 */
		this.specificity = specificity;
	}

	/**
	 * @deprecated
	 */
	var hasWarned = false;
	Selector.prototype.matches = function (node, blueprint) {
		if (!hasWarned) {
			console.warn('Selector#matches is deprecated, please use Selector#evaluate instead');
			hasWarned = true;
		}
		var result = this.evaluate(new DynamicContext({
				contextItem: Sequence.singleton(new NodeValue(node, blueprint)),
				contextSequence: null,
				blueprint: blueprint,
				variables: {}
			}));

		return result.getEffectiveBooleanValue();
	};

	/**
	 * Compare this selector to the other selector, checking equivalence
	 *
	 * @param   {Selector}  selector
	 * @return  {boolean}   Whether this selector is equivalent to the other
	 */
	Selector.prototype.equals = function (otherSelector) {
		throw new Error('Not Implemented');
	};

	/**
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of selectors to only those potentially applicable to a givne
	 * node. Use getBucketsForNode to determine the buckets to consider for a given node.
	 *
	 * @return  {String|null}  Bucket name, or null if the selector is not bucketable.
	 */
	Selector.prototype.getBucket = function () {
		return null;
	};

	Selector.prototype.evaluate = function (dynamicContext) {
		throw new Error('Not Implemented');
	};

	return Selector;
});
