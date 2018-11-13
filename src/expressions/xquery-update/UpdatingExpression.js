import Expression from '../Expression';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';

/**
 * @abstract
 */
class UpdatingExpression extends Expression {
	evaluate (_dynamicContext, _executionParameters) {
		throw new Error('Can not execute an updating expression without catching the pending updates');
	}

	/**
	 * @abstract
	 * @param   {?DynamicContext}        _dynamicContext
	 * @param   {!ExecutionParameters}   _executionParameters
	 */
	evaluateWithUpdateList (_dynamicContext, _executionParameters) {
		//    throw new Error('Not Implemented');
	}
}

export default UpdatingExpression;
