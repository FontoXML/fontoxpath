/**
 * @enum {string}
 */
const RESULT_ORDERINGS = {
	SORTED: 'sorted',
	REVERSE_SORTED: 'reverse-sorted',
	UNSORTED: 'unsorted'
};

/**
 * @type {!{resultOrder: !RESULT_ORDERINGS, subtree: boolean, peer: boolean}}
 */
let optimizationOptions;

/**
 * @abstract
 */
class Selector {
	/**
	 * @param  {!./Specificity}        specificity
	 * @param  {!optimizationOptions=} optimizationOptions              Additional information on this expression.
 are ancestors of each other
	 */
	constructor (specificity, optimizationOptions = { resultOrder: RESULT_ORDERINGS.UNSORTED, peer: false, subtree: false }) {
		this.specificity = specificity;
		this.expectedResultOrder = optimizationOptions.resultOrder;
		this.subtree = !!optimizationOptions.subtree;
		this.peer = !!optimizationOptions.peer;


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
