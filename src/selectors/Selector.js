define([
], function (
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

	Selector.prototype.evaluate = function (nodes, blueprint) {
		throw new Error('Not Implemented');
	};

	return Selector;
});
