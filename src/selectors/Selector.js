import DynamicContext from './DynamicContext';

/**
 * @enum {string}
 */
const RESULT_ORDERINGS = {
	SORTED: 'sorted',
	REVERSE_SORTED: 'reverse-sorted',
	UNSORTED: 'unsorted'
};

/**
 * @type {!{resultOrder: !RESULT_ORDERINGS, subtree: boolean, peer: boolean, canBeStaticallyEvaluated: boolean}}
 */
let OptimizationOptions;

/**
 * @abstract
 */
class Selector {
	/**
	 * @param  {!./Specificity}         specificity
	 * @param  {!OptimizationOptions=}  optimizationOptions  Additional information on this expression.
 are ancestors of each other
	 */
	constructor (specificity, optimizationOptions = { resultOrder: RESULT_ORDERINGS.UNSORTED, peer: false, subtree: false }) {
		this.specificity = specificity;
		this.expectedResultOrder = optimizationOptions.resultOrder || RESULT_ORDERINGS.UNSORTED;
		this.subtree = !!optimizationOptions.subtree;
		this.peer = !!optimizationOptions.peer;
		this.canBeStaticallyEvaluated = !!optimizationOptions.canBeStaticallyEvaluated;

		// Eagerly evaluate
		this._eagerlyEvaluatedValue = null;
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
	 * @public
	 * @final
	 * @param   {?./DynamicContext}      dynamicContext
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluateMaybeStatically (dynamicContext) {
		if (dynamicContext.contextItem === null) {
			// We must be free of context here. But: this will be memoized / constant folded on a higher level, so there is no use in keeping these intermediate results
			return this.evaluate(dynamicContext);
		}
		if (this.canBeStaticallyEvaluated) {
			return this.evaluateWithoutFocus(dynamicContext);
		}
		return this.evaluate(dynamicContext);
	}

	/**
	 * @abstract
	 * @param   {!./DynamicContext}  _dynamicContext
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluate (_dynamicContext) {
		//    throw new Error('Not Implemented');
	}

	/**
	 * @protected
	 * @final
	 * @param   {?./DynamicContext}      contextlessDynamicContext
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluateWithoutFocus (contextlessDynamicContext) {
		if (this._eagerlyEvaluatedValue === null) {
			this._eagerlyEvaluatedValue = this.evaluate(contextlessDynamicContext).expandSequence();
		}
		return this._eagerlyEvaluatedValue;
	}
}

export default Selector;
