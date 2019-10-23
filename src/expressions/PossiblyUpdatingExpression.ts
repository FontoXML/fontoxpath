import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { OptimizationOptions } from './Expression';
import Specificity from './Specificity';
import UpdatingExpressionResult from './UpdatingExpressionResult';
import { DONE_TOKEN, IAsyncIterator, IterationHint, notReady, ready } from './util/iterators';
import { mergeUpdates } from './xquery-update/pulRoutines';
import UpdatingExpression from './xquery-update/UpdatingExpression';
import { IPendingUpdate } from './xquery-update/IPendingUpdate';
import StaticContext from './StaticContext';

export type SequenceCallbacks = ((dynamicContext: DynamicContext) => ISequence)[];

/**
 * Separate the XDMValue of an updatingExpressionResultIterator to a Sequence and output the PUL in
 * the callback.  The sequence will only continue when the updatingExpressionResultIterator has
 * reached the 'DONE' state, and the full PUL is known
 *
 * @param updatingExpressionResultIterator An AsyncIterator to an UpdatingExpressionResult
 *
 * @param outputPUL Will be called with the PUL part of the AsyncIterator, as soon as it is known
 *
 * @return The XDMValue, as an ISequence
 */
export function separateXDMValueFromUpdatingExpressionResult(
	updatingExpressionResultIterator: IAsyncIterator<UpdatingExpressionResult>,
	outputPUL: (updates: IPendingUpdate[]) => void
): ISequence {
	let allValues: Value[];
	let i = 0;
	let itResult = updatingExpressionResultIterator.next(IterationHint.NONE);
	// Shortcut for synchronous values. Forces the PUL to be immediately available
	if (itResult.ready) {
		outputPUL(itResult.value.pendingUpdateList);
		allValues = itResult.value.xdmValue;
		return sequenceFactory.create(allValues);
	}
	return sequenceFactory.create({
		next: () => {
			if (!allValues) {
				if (!itResult) {
					itResult = updatingExpressionResultIterator.next(IterationHint.NONE);
				}
				if (!itResult.ready) {
					const toReturn = notReady(itResult.promise);
					itResult = null;
					return toReturn;
				}
				outputPUL(itResult.value.pendingUpdateList);
				allValues = itResult.value.xdmValue;
			}
			if (i >= allValues.length) {
				return DONE_TOKEN;
			}
			return ready(allValues[i++]);
		}
	});
}

/**
 * Base class for All XQuery expressions that _may_ be updating, such as FunctionCalls,
 * SequenceExpressions, etc.
 */
export default abstract class PossiblyUpdatingExpression extends Expression {
	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions
	) {
		super(specificity, childExpressions, optimizationOptions, true);

		this.isUpdating = this._childExpressions.some(
			childExpression => childExpression.isUpdating
		);
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions.map(expr => (innerDynamicContext: DynamicContext) =>
				expr.evaluate(innerDynamicContext, executionParameters)
			)
		);
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IAsyncIterator<UpdatingExpressionResult> {
		let updateList = [];

		const sequence = this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions.map(expr => {
				if (!expr.isUpdating) {
					return (innerDynamicContext: DynamicContext) =>
						expr.evaluate(innerDynamicContext, executionParameters);
				}
				return (innerDynamicContext: DynamicContext) => {
					const updatingExpression = expr as UpdatingExpression;
					const updateListAndValue = updatingExpression.evaluateWithUpdateList(
						innerDynamicContext,
						executionParameters
					);
					return separateXDMValueFromUpdatingExpressionResult(
						updateListAndValue,
						pendingUpdates => (updateList = mergeUpdates(updateList, pendingUpdates))
					);
				};
			})
		);

		let done = false;
		return {
			next: (_hint: IterationHint) => {
				if (done) {
					return DONE_TOKEN;
				}
				// Ensure we fully exhaust the inner expression so that the pending update list is
				// filled
				const allValues = sequence.tryGetAllValues();
				if (!allValues.ready) {
					return notReady(allValues.promise);
				}
				done = true;
				return ready(new UpdatingExpressionResult(allValues.value, updateList));
			}
		};
	}

	/**
	 *
	 * @param _dynamicContext       The context at this point, containing the context item and variable bindings
	 * @param _executionParameters
	 * @param _sequenceCallbacks    Callbacks to the Expression#evaluate methods of the childExpressions. The order is the same as the childExpressions passed in the constructor of this class
	 */
	public abstract performFunctionalEvaluation(
		_dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		_sequenceCallbacks: SequenceCallbacks
	): ISequence;

	/**
	 * Some expressions (mainly function calls) determine their updatingness during static
	 * evaluation. Propagate this
	 */
	protected determineUpdatingness() {
		if (this._childExpressions.some(expr => expr.isUpdating)) {
			this.isUpdating = true;
		}
	}
	public performStaticEvaluation(staticContext: StaticContext): void {
		super.performStaticEvaluation(staticContext);
		this.determineUpdatingness();
	}
}
