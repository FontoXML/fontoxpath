import Expression from '../Expression';
import SequenceFactory from '../dataTypes/SequenceFactory';
import Specificity from '../Specificity';

class ContextItemExpression extends Expression {
	constructor () {
		super(
			new Specificity({}),
			[],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED
			}
		);
	}

	evaluate (dynamicContext, _executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use the "." operator');
		}
		return SequenceFactory.singleton(dynamicContext.contextItem);
	}

}
export default ContextItemExpression;
