import Expression from './Expression';
import { DONE_TOKEN, ready, notReady, AsyncIterator } from './util/iterators';
import { mergeUpdates } from './xquery-update/pulRoutines';
import SequenceFactory from './dataTypes/SequenceFactory';
import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Value from './dataTypes/Value';
import { PendingUpdate } from './xquery-update/PendingUpdate';

export class UpdatingExpressionResult {
	xdmValue: Array<Value>
	pendingUpdateList: Array<PendingUpdate>
	constructor (/** !Array<!Value> */values, /** !Array<!PendingUpdate> */ pendingUpdateList) {
		this.xdmValue = values;
		this.pendingUpdateList = pendingUpdateList;
	}
}

abstract class PossiblyUpdatingExpression extends Expression {
	constructor (a, b, c) {
		super(a, b, c);

		this.isUpdating = this._childExpressions.some(childExpression => childExpression.isUpdating);
	}

	abstract performFunctionalEvaluation (
		_dynamicContext: DynamicContext,
		_executionParameters: ExecutionParameters,
		_sequenceCallbacks: Array<(DynamicContext) => ISequence>) : ISequence;

	evaluate (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions
				.map(expr => innerDynamicContext => expr.evaluate(innerDynamicContext, executionParameters)));
	}

	evaluateWithUpdateList (dynamicContext: DynamicContext, executionParameters: ExecutionParameters): AsyncIterator<UpdatingExpressionResult> {
		let updateList = [];

		const sequence = this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions.map(expr => {
				if (!expr.isUpdating) {
					return innerDynamicContext => expr.evaluate(innerDynamicContext, executionParameters);
				}
				return innerDynamicContext => {
					const updatingExpression = expr as PossiblyUpdatingExpression;
					const updateListAndValue = updatingExpression.evaluateWithUpdateList(innerDynamicContext, executionParameters);
					let values;
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
								updateList = mergeUpdates(updateList, ...attempt.value.pendingUpdateList);
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
				return ready(new UpdatingExpressionResult(allValues.value as Array<Value>, updateList));
			}
		};
	}
}

export default PossiblyUpdatingExpression;
