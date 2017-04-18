/**
 * @enum {string}
 */
const RESULT_ORDERINGS = {
	SORTED: 'sorted',
	REVERSE_SORTED: 'reverse-sorted',
	UNSORTED: 'unsorted'
};

/**
 * @abstract
 */
class Selector {
	/**
	 * @param  {!./Specificity}  specificity
	 * @param  {!RESULT_ORDERINGS}       expectedResultOrder  Describe what the expected sorting order is, will be used to shortcut sorting at various places.
	 *                                               Either 'sorted', 'reverse-sorted' or 'unsorted'. Sorted sequences are expected to be deduplicated.
	 * @param  {Object=}          optimizationOptions
	 */
	constructor (specificity, expectedResultOrder, optimizationOptions = {}) {
		this.specificity = specificity;
		this.expectedResultOrder = expectedResultOrder;

		this._optimizationOptions = optimizationOptions;
		this._getStringifiedValue = () => null;
	}

	static get RESULT_ORDERINGS () {
		return RESULT_ORDERINGS;
	}
	get RESULT_ORDERINGS () {
		return RESULT_ORDERINGS;
	}

	/**
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of selectors to only those potentially applicable to a givne
	 * node. Use getBucketsForNode to determine the buckets to consider for a given node.
	 *
	 * @return  {?string}  Bucket name, or null if the selector is not bucketable.
	 */
	getBucket () {
		return null;
	}

	toString () {
		return this._getStringifiedValue();
	}

	/**
	 * @abstract
	 * @param   {!./DynamicContext}  _dynamicContext
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluate (_dynamicContext) {
		//    throw new Error('Not Implemented');
	}
};

export default Selector;
