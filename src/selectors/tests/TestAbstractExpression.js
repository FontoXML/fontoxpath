import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 * @abstract
 */
class TestAbstractSelector extends Selector {
	/**
	 * @param  {!../Specificity}  specificity
	 */
	constructor (specificity) {
		super(specificity, { canBeStaticallyEvaluated: false });
	}

	/**
	 * @abstract
	 * @param   {!../DynamicContext}        _dynamicContext
	 * @param   {!../dataTypes/AtomicValue}  _item
	 * @return  {boolean}
	 */
	evaluateToBoolean (_dynamicContext, _item) {
	}

	evaluate (dynamicContext) {
		return this.evaluateToBoolean(dynamicContext, dynamicContext.contextItem) ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}

}

export default TestAbstractSelector;
