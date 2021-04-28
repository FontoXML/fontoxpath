import Expression from '../Expression';

import sequenceFactory from '../dataTypes/sequenceFactory';

import AtomicValue from '../dataTypes/AtomicValue';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';

abstract class TestAbstractExpression extends Expression {
	constructor(specificity) {
		super(specificity, [], { canBeStaticallyEvaluated: false });
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return this.evaluateToBoolean(
			dynamicContext,
			dynamicContext.contextItem,
			executionParameters
		)
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}

	public abstract evaluateToBoolean(
		dynamicContext: DynamicContext,
		item: AtomicValue,
		executionParameters: ExecutionParameters
	): boolean;
}

export default TestAbstractExpression;
