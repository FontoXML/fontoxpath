import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';

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
	 * @param  {!Array<!Selector>}      childSelectors       The logical children of this Expression
	 * @param  {!OptimizationOptions}   optimizationOptions  Additional information on this expression.
	 */
	constructor (
		specificity,
		childSelectors,
		optimizationOptions = {
			resultOrder: RESULT_ORDERINGS.UNSORTED,
			peer: false,
			subtree: false,
			canBeStaticallyEvaluated: false
		}
	) {

		/**
		 * @property {!./Specificity} specificity
		 */
		this.specificity = specificity;
		this.expectedResultOrder = optimizationOptions.resultOrder || RESULT_ORDERINGS.UNSORTED;
		this.subtree = !!optimizationOptions.subtree;
		this.peer = !!optimizationOptions.peer;
		this.canBeStaticallyEvaluated = !!optimizationOptions.canBeStaticallyEvaluated;

		this._childSelectors = childSelectors;

		/**
		 * Eagerly evaluate
		 *
		 * @type {?./dataTypes/Sequence}
		 */
		this._eagerlyEvaluatedValue = null;
	}

	static get RESULT_ORDERINGS () {
		return RESULT_ORDERINGS;
	}
	get RESULT_ORDERINGS () {
		return RESULT_ORDERINGS;
	}


	/**
	 * @param  {!./StaticContext}  staticContext
	 */
	performStaticEvaluation (staticContext) {
		this._childSelectors.forEach(selector => selector.performStaticEvaluation(staticContext));
	}

	/**
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of selectors to only those potentially
	 * applicable to a given node. Use getBucketsForNode to determine the buckets to consider for a
	 * given node.
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
	 * @param   {!ExecutionParameters}   executionParameters
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluateMaybeStatically (dynamicContext, executionParameters) {
		if (!dynamicContext || dynamicContext.contextItem === null) {
			// We must be free of context here. But: this will be memoized / constant folded on a
			// higher level, so there is no use in keeping these intermediate results
			return this.evaluate(dynamicContext, executionParameters);
		}
		if (this.canBeStaticallyEvaluated) {
			return this.evaluateWithoutFocus(dynamicContext, executionParameters);
		}
		return this.evaluate(dynamicContext, executionParameters);
	}

	/**
	 * @abstract
	 * @param   {!./DynamicContext}      _dynamicContext
	 * @param   {!ExecutionParameters}   _executionParameters
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluate (_dynamicContext, _executionParameters) {
		//    throw new Error('Not Implemented');
	}

	/**
	 * @protected
	 * @final
	 * @param   {?./DynamicContext}      _contextlessDynamicContext
	 * @param   {!ExecutionParameters}   executionParameters
	 * @return  {!./dataTypes/Sequence}
	 */
	evaluateWithoutFocus (_contextlessDynamicContext, executionParameters) {
		if (this._eagerlyEvaluatedValue === null) {
			this._eagerlyEvaluatedValue = this.evaluate(
				null,
				executionParameters
			).expandSequence();
		}
		return this._eagerlyEvaluatedValue;
	}
}

export default Selector;
