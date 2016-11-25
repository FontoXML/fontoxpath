define([
	'../DomFacade',
	'./DynamicContext',
	'./dataTypes/Sequence',
	'./dataTypes/NodeValue'
], function (
	DomFacade,
	DynamicContext,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * @param  {Specificity}  specificity
	 * @param  {string}       expectedResultOrder  Describe what the expected sorting order is, will be used to shortcut sorting at various places.
	 *                                               Either 'sorted', 'reverse-sorted' or 'unsorted'. Sorted sequences are expected to be deduplicated.
	 */
	function Selector (specificity, expectedResultOrder) {
		/**
		 * @type  {Specificity}
		 */
		this.specificity = specificity;

		this.expectedResultOrder = expectedResultOrder;
	}

	Selector.RESULT_ORDER_SORTED = Selector.prototype.RESULT_ORDER_SORTED = 'sorted';
	Selector.RESULT_ORDER_REVERSE_SORTED = Selector.prototype.RESULT_ORDER_REVERSE_SORTED = 'reverse-sorted';
	Selector.RESULT_ORDER_UNSORTED = Selector.prototype.RESULT_ORDER_UNSORTED = 'unsorted';

	/**
	 * @deprecated
	 */
	Selector.prototype.matches = function (node, blueprint) {
		var result = this.evaluate(new DynamicContext({
				contextItem: Sequence.singleton(new NodeValue(blueprint, node)),
				contextSequence: null,
				domFacade: new DomFacade(blueprint),
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
