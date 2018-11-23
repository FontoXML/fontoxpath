import DynamicContext from './DynamicContext';
import StaticContext from './StaticContext';
import ExecutionParameters from './ExecutionParameters';
import Specificity from './Specificity';
import Sequence from './dataTypes/Sequence';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

/**
 * @enum {string}
 */
const RESULT_ORDERINGS = {
	SORTED: 'sorted',
	REVERSE_SORTED: 'reverse-sorted',
	UNSORTED: 'unsorted'
};

/**
 * @typedef {!({resultOrder: (!RESULT_ORDERINGS|undefined), subtree: (boolean|undefined), peer: (boolean|undefined), canBeStaticallyEvaluated: (boolean|undefined)})}
 */
let OptimizationOptions;

/**
 * @abstract
 */
class Expression {
	/**
	 * @param  {!Specificity}           specificity
	 * @param  {!Array<!Expression>}      childExpressions       The logical children of this Expression
	 * @param  {!OptimizationOptions}   optimizationOptions  Additional information on this expression.
	 */
	constructor (
		specificity,
		childExpressions,
		optimizationOptions = {
			resultOrder: RESULT_ORDERINGS.UNSORTED,
			peer: false,
			subtree: false,
			canBeStaticallyEvaluated: false
		}
	) {

		this.specificity = specificity;
		this.expectedResultOrder = optimizationOptions.resultOrder || RESULT_ORDERINGS.UNSORTED;
		this.subtree = !!optimizationOptions.subtree;
		this.peer = !!optimizationOptions.peer;
		this.canBeStaticallyEvaluated = !!optimizationOptions.canBeStaticallyEvaluated;

		this._childExpressions = childExpressions;

		this.isUpdating = false;

		/**
		 * Eagerly evaluate
		 *
		 * @type {?function():!Sequence}
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
	 * @param  {!StaticContext}  staticContext
	 */
	performStaticEvaluation (staticContext) {
		this._childExpressions.forEach(selector => selector.performStaticEvaluation(staticContext));
	}

	/**
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of expressions to only those potentially
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
	 * @param   {?DynamicContext}        dynamicContext
	 * @param   {!ExecutionParameters}   executionParameters
	 * @return  {!Sequence}
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
	 * @param   {?DynamicContext}        _dynamicContext
	 * @param   {!ExecutionParameters}   _executionParameters
	 * @return  {!Sequence}
	 */
	evaluate (_dynamicContext, _executionParameters) {
		//    throw new Error('Not Implemented');
	}

	/**
	 * @protected
	 * @final
	 * @param   {?DynamicContext}      _contextlessDynamicContext
	 * @param   {!ExecutionParameters}   executionParameters
	 * @return  {!Sequence}
	 */
	evaluateWithoutFocus (_contextlessDynamicContext, executionParameters) {
		if (this._eagerlyEvaluatedValue === null) {
			this._eagerlyEvaluatedValue = createDoublyIterableSequence(this.evaluate(
				null,
				executionParameters
			).expandSequence());
		}
		return this._eagerlyEvaluatedValue();
	}
}

export default Expression;
