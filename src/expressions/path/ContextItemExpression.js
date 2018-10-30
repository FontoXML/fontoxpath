import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import Specificity from '../Specificity';

/**
 * @extends {Expression}
 */
class ContextItemExpression extends Expression {
	constructor () {
		super(
			new Specificity({}),
			[]
		);
	}

	evaluate (dynamicContext, _executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use the "." operator');
		}
		return Sequence.singleton(dynamicContext.contextItem);
	}

}
export default ContextItemExpression;
