import Expression from '../Expression';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';

/**
 * @abstract
 */
class UpdatingExpression extends Expression {
	constructor (...args) {
		super(...args);

		this.isUpdating = true;
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
