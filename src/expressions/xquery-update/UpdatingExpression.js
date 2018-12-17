import Expression from '../Expression';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { ready } from '../util/iterators';

/**
 * @abstract
 */
class UpdatingExpression extends Expression {
	constructor (...args) {
		super(...args);

		this.isUpdating = true;
	}

	ensureUpdateListWrapper (expression) {
		if (expression.isUpdating) {
			return (dynamicContext, executionParameters) => expression.evaluateWithUpdateList(dynamicContext, executionParameters);
		}

		return (dynamicContext, executionParameters) => {
			const sequence = expression.evaluate(dynamicContext, executionParameters);
			return {
				next: () => {
					const allValues = sequence.tryGetAllValues();
					if (!allValues.ready) {
						return allValues;
					}
					return ready({
						pendingUpdateList: [],
						xdmValue: allValues.value
					});
				}
			};
		};
	}

	evaluate (_dynamicContext, _executionParameters) {
		throw new Error('Can not execute an updating expression without catching the pending updates');
	}

	/**
	 * @abstract
	 * @param   {?DynamicContext}        _dynamicContext
	 * @param   {!ExecutionParameters}   _executionParameters
	 * @returns {{next: function(): ?}}
	 */
	evaluateWithUpdateList (_dynamicContext, _executionParameters) {
		//    throw new Error('Not Implemented');
	}
}

export default UpdatingExpression;
