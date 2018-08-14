import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';

import DynamicContext from '../DynamicContext';
import AtomicValue from '../dataTypes/AtomicValue';

/**
 * @extends {Expression}
 * @abstract
 */
class TestAbstractExpression extends Expression {
	constructor (specificity) {
		super(specificity, [], { canBeStaticallyEvaluated: false });
	}

	/**
	 * @abstract
	 * @param   {DynamicContext}        _dynamicContext
	 * @param   {AtomicValue}  _item
	 * @return  {boolean}
	 */
	evaluateToBoolean (_dynamicContext, _item) {
	}

	evaluate (dynamicContext, _executionParameters) {
		return this.evaluateToBoolean(dynamicContext, dynamicContext.contextItem) ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}

}

export default TestAbstractExpression;
