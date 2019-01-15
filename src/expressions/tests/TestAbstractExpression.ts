import Expression from '../Expression';

import sequenceFactory from '../dataTypes/sequenceFactory';

import AtomicValue from '../dataTypes/AtomicValue';
import DynamicContext from '../DynamicContext';

abstract class TestAbstractExpression extends Expression {
	constructor(specificity) {
		super(specificity, [], { canBeStaticallyEvaluated: false });
	}

	public evaluate(dynamicContext, _executionParameters) {
		return this.evaluateToBoolean(dynamicContext, dynamicContext.contextItem)
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}

	public abstract evaluateToBoolean(dynamicContext: DynamicContext, item: AtomicValue): boolean;
}

export default TestAbstractExpression;
