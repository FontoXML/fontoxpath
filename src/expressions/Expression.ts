import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Specificity from './Specificity';
import StaticContext from './StaticContext';
import createDoublyIterableSequence from './util/createDoublyIterableSequence';

export enum RESULT_ORDERINGS {
	SORTED = 'sorted',
	REVERSE_SORTED = 'reverse-sorted',
	UNSORTED = 'unsorted'
}

export type OptimizationOptions = {
	canBeStaticallyEvaluated?: boolean;
	peer?: boolean;
	resultOrder?: string;
	subtree?: boolean;
};

abstract class Expression {
	public canBeStaticallyEvaluated: boolean;
	public expectedResultOrder: string;
	public expression: string;
	public isUpdating: boolean;
	public peer: boolean;
	public specificity: Specificity;
	public subtree: boolean;
	private _childExpressions: Expression[];
	private _eagerlyEvaluatedValue: () => ISequence;

	constructor(
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

	public abstract evaluate(
		_dynamicContext?: DynamicContext,
		_executionParameters?: ExecutionParameters
	): ISequence;

	public evaluateMaybeStatically(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
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
	 * Retrieve the bucket name, if any, in which this selector can be presorted.
	 *
	 * Buckets can be used for quickly filtering a set of expressions to only those potentially
	 * applicable to a given node. Use getBucketsForNode to determine the buckets to consider for a
	 * given node.
	 */
	public getBucket(): string | null {
		return null;
	}

	public performStaticEvaluation(staticContext: StaticContext): void {
		this._childExpressions.forEach(selector => selector.performStaticEvaluation(staticContext));
	}

	protected evaluateWithoutFocus(
		_contextlessDynamicContext: DynamicContext | null,
		executionParameters: ExecutionParameters
	): ISequence {
		if (this._eagerlyEvaluatedValue === null) {
			this._eagerlyEvaluatedValue = createDoublyIterableSequence(
				this.evaluate(null, executionParameters).expandSequence()
			);
		}
		return this._eagerlyEvaluatedValue();
	}
}

export default Expression;
