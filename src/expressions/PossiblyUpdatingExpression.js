import Expression from './Expression';
import { DONE_TOKEN, ready } from './util/iterators';
import { mergeUpdates } from './xquery-update/pulRoutines';
import Sequence from './dataTypes/Sequence';

class PossiblyUpdatingExpression extends Expression {
	constructor (...constructorArguments) {
		super(...constructorArguments);
	}

	/**
	 * @abstract
	 *
	 * @param   {Array<(function():Sequence)>} _sequenceCallbacks
	 * @param   {ExecutionParameters}          _executionParameters
	 * @param   {DynamicContest}               _dynamicContest
	 * @return  {Sequence}
	 */
	performFunctionalEvaluation (_dynamicContext, _executionParamaters, _sequenceCallbacks) {

	}

	evaluate (dynamicContext, executionParamaters) {
		return this.performFunctionalEvaluation(
			dynamicContext,
			executionParamaters,
			this._childExpressions
				.map(expr => innerDynamicContext => expr.evaluate(innerDynamicContext)));
	}

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
					const updateListAndValue = expr.evaluateWithUpdateList(innerDynamicContext, executionParameters);
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
								updateList = mergeUpdates(updateList, attempt.value.pendingUpdateList);
								values = attempt.value.value;
							}

							if (i > values.length) {
								done = true;
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
				return ready({
					pendingUpdateList: updateList,
					xdmValue: allValues.value
				});
			}
		};
	}
}

export default PossiblyUpdatingExpression;
