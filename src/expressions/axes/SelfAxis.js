import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class SelfAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  selector
	 */
	constructor (selector) {
		super(
			selector.specificity,
			[selector],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED,
				subtree: true,
				peer: true,
				canBeStaticallyEvaluated: false
			});

		this._selector = selector;
	}

	evaluate (dynamicContext, _executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		var isMatch = this._selector.evaluateToBoolean(dynamicContext, dynamicContext.contextItem);
		return isMatch ? Sequence.singleton(dynamicContext.contextItem) : Sequence.empty();
	}

	getBucket () {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
