import Expression from './Expression';
import { DONE_TOKEN, ready, AsyncIterator } from './util/iterators';
import { mergeUpdates } from './xquery-update/pulRoutines';
import Sequence from './dataTypes/Sequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Value from './dataTypes/Value';
import { PendingUpdate } from './xquery-update/PendingUpdate';

export class UpdatingExpressionResult {
	constructor (/** !Array<!Value> */values, /** !Array<!PendingUpdate> */ pendingUpdateList) {
		this.xdmValue = values;
		this.pendingUpdateList = pendingUpdateList;
	}
}

/**
 * @abstract
 */
class PossiblyUpdatingExpression extends Expression {
	constructor (...args) {
		super(...args);

		this.isUpdating = this._childExpressions.some(childExpression => childExpression.isUpdating);
	}

	/**
	 * @abstract
	 *
	 * @param   {DynamicContext}                                _dynamicContext
	 * @param   {!ExecutionParameters}                          _executionParameters
	 * @param   {!Array<(function(DynamicContext):!Sequence)>}  _sequenceCallbacks
	 * @return  {!Sequence}
	 */
	performFunctionalEvaluation (_dynamicContext, _executionParameters, _sequenceCallbacks) {

	}

	evaluate (dynamicContext, executionParameters) {
		return this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions
				.map(expr => innerDynamicContext => expr.evaluate(innerDynamicContext, executionParameters)));
	}

	/**
	 * @param   {!DynamicContext}                               dynamicContext
	 * @param   {!ExecutionParameters}                          executionParameters
	 * @return  {!AsyncIterator<UpdatingExpressionResult>}
	 */
	evaluateWithUpdateList (dynamicContext, executionParameters) {
		let updateList = [];

		const sequence = this.performFunctionalEvaluation(
			dynamicContext,
			executionParameters,
			this._childExpressions.map(expr => {
				if (!expr.isUpdating) {
					return innerDynamicContext => expr.evaluate(innerDynamicContext, executionParameters);
				}
				return innerDynamicContext => {
					const updatingExpression = /** @type {PossiblyUpdatingExpression} */ (expr);
					const updateListAndValue = updatingExpression.evaluateWithUpdateList(innerDynamicContext, executionParameters);
					let values;
					let done = false;
					let i = 0;
					return new Sequence({
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
					return allValues;
				}
				done = true;
				return ready(new UpdatingExpressionResult(allValues.value, updateList));
			}
		};
	}
}

export default PossiblyUpdatingExpression;
