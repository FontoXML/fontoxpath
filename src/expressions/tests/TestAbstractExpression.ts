import AtomicValue from '../dataTypes/AtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression from '../Expression';

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
