import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';

import DynamicContext from '../DynamicContext';
import AtomicValue from '../dataTypes/AtomicValue';

abstract class TestAbstractExpression extends Expression {
	constructor(specificity) {
		super(specificity, [], { canBeStaticallyEvaluated: false });
	}

	abstract evaluateToBoolean(dynamicContext: DynamicContext, item: AtomicValue): boolean;

	evaluate(dynamicContext, _executionParameters) {
		return this.evaluateToBoolean(dynamicContext, dynamicContext.contextItem)
			? SequenceFactory.singletonTrueSequence()
			: SequenceFactory.singletonFalseSequence();
	}
}

export default TestAbstractExpression;
