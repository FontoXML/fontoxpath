import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';

class ContextItemExpression extends Expression {
	constructor() {
		super(new Specificity({}), [], {
			resultOrder: RESULT_ORDERINGS.SORTED,
		});
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error(
				'XPDY0002: context is absent, it needs to be present to use the "." operator'
			);
		}
		return sequenceFactory.singleton(dynamicContext.contextItem);
	}
}
export default ContextItemExpression;
