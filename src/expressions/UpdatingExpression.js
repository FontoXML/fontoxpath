import Expression from './Expression';

/**
 * @abstract
 * @extends     {Expression}
 */
class UpdatingExpression extends Expression {
	/**
	 * @abstract
	 * @param   {?DynamicContext}        _dynamicContext
	 * @param   {!ExecutionParameters}   _executionParameters
	 */
	evaluate (_dynamicContext, _executionParameters) {
		//    throw new Error('Not Implemented');
	}
}

export default UpdatingExpression;
