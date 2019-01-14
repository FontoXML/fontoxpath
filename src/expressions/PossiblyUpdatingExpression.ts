import ISequence from './dataTypes/ISequence';
import SequenceFactory from './dataTypes/SequenceFactory';
import Value from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { OptimizationOptions } from './Expression';
import Specificity from './Specificity';
import { AsyncIterator, DONE_TOKEN, notReady, ready } from './util/iterators';
import { PendingUpdate } from './xquery-update/PendingUpdate';
import { mergeUpdates } from './xquery-update/pulRoutines';

export class UpdatingExpressionResult {
	public pendingUpdateList: PendingUpdate[];
	public xdmValue: Value[];
	constructor(values: Value[], pendingUpdateList: PendingUpdate[]) {
		this.xdmValue = values;
		this.pendingUpdateList = pendingUpdateList;
	}
}

abstract class PossiblyUpdatingExpression extends Expression {
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
	): AsyncIterator<UpdatingExpressionResult> {
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
					const updatingExpression = expr as PossiblyUpdatingExpression;
					const updateListAndValue = updatingExpression.evaluateWithUpdateList(
						innerDynamicContext,
						executionParameters
					);
					let values: Value[];
					let done = false;
					let i = 0;
					return SequenceFactory.create({
						next: () => {
							if (done) {
								return DONE_TOKEN;
							}
							if (!values) {
								const attempt = updateListAndValue.next();
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
								done = true;
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
			next: () => {
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
		_sequenceCallbacks: ((dynamicContext: DynamicContext) => ISequence)[]
	): ISequence;
}

export default PossiblyUpdatingExpression;
