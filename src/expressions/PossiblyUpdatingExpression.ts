import ISequence from './dataTypes/ISequence';
import sequenceFactory from './dataTypes/sequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { OptimizationOptions } from './Expression';
import Specificity from './Specificity';
import UpdatingExpressionResult from './UpdatingExpressionResult';
<<<<<<< HEAD
import { AsyncIterator, DONE_TOKEN, IterationHint, notReady, ready } from './util/iterators';
=======
import { DONE_TOKEN, IAsyncIterator, notReady, ready } from './util/iterators';
>>>>>>> Start on fixing tests
import { mergeUpdates } from './xquery-update/pulRoutines';
import UpdatingExpression from './xquery-update/UpdatingExpression';

export type SequenceCallbacks = ((dynamicContext: DynamicContext) => ISequence)[];
export default abstract class PossiblyUpdatingExpression extends Expression {
	constructor(
		specificity: Specificity,
		childExpressions: Expression[],
		optimizationOptions: OptimizationOptions
	) {
		super(specificity, childExpressions, optimizationOptions);

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
					let values: Value[];
					let doneWithChildExpressions = false;
					let i = 0;
					return sequenceFactory.create({
						next: (_hint: IterationHint) => {
							if (doneWithChildExpressions) {
								return DONE_TOKEN;
							}
							if (!values) {
								// For now we do not support hints in updating expressions as we
								// retrieve all results at once.
								const attempt = updateListAndValue.next(IterationHint.NONE);
								if (!attempt.ready) {
									return attempt;
								}
								updateList = mergeUpdates(
									updateList,
									...attempt.value.pendingUpdateList
								);
								values = attempt.value.xdmValue;
							}

							if (i >= values.length) {
								doneWithChildExpressions = true;
								return DONE_TOKEN;
							}

							return ready(values[i++]);
						}
					});
				};
			})
		);

		let done = false;
		return {
			next: (_hint: IterationHint) => {
				if (done) {
					return DONE_TOKEN;
				}
				// Ensure we fully exhaust the inner expression so that the pending update list is filled
				const allValues = sequence.tryGetAllValues();
				if (!allValues.ready) {
					return notReady(allValues.promise);
				}
				done = true;
				return ready(new UpdatingExpressionResult(allValues.value, updateList));
			}
		};
	}

	public abstract performFunctionalEvaluation(
		_dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		_sequenceCallbacks: SequenceCallbacks
	): ISequence;
}
