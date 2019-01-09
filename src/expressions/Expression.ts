import DynamicContext from './DynamicContext';
import StaticContext from './StaticContext';
import ExecutionParameters from './ExecutionParameters';
import Specificity from './Specificity';
import ISequence from './dataTypes/ISequence';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

enum RESULT_ORDERINGS {
	SORTED = 'sorted',
	REVERSE_SORTED = 'reverse-sorted',
	UNSORTED = 'unsorted'
}

export type OptimizationOptions = ({
	resultOrder?: string;
	subtree?: boolean;
	peer?: boolean;
	canBeStaticallyEvaluated?: boolean;
});

abstract class Expression {
	specificity: Specificity;
	expression: string;
	subtree: boolean;
	peer: boolean;
	canBeStaticallyEvaluated: boolean;
	_childExpressions: Expression[];
	isUpdating: boolean;
	_eagerlyEvaluatedValue: () => ISequence;
	expectedResultOrder: string;

	constructor (
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions = {
			resultOrder: RESULT_ORDERINGS.UNSORTED,
			subtree: false,
			peer: false,
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

		this._eagerlyEvaluatedValue = null;
	}

	static RESULT_ORDERINGS: typeof RESULT_ORDERINGS = RESULT_ORDERINGS;
	RESULT_ORDERINGS: typeof RESULT_ORDERINGS = RESULT_ORDERINGS


	performStaticEvaluation (staticContext:StaticContext): void {
		this._childExpressions.forEach(selector => selector.performStaticEvaluation(staticContext));
	}

	/**
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of expressions to only those potentially
	 * applicable to a given node. Use getBucketsForNode to determine the buckets to consider for a
	 * given node.
	 */
	getBucket ():string|null {
		return null;
	}

	evaluateMaybeStatically (dynamicContext:DynamicContext, executionParameters:ExecutionParameters): ISequence {
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

	abstract evaluate (_dynamicContext?: DynamicContext, _executionParameters?: ExecutionParameters): ISequence;

	protected evaluateWithoutFocus (_contextlessDynamicContext: (DynamicContext|null), executionParameters:ExecutionParameters): ISequence {
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
