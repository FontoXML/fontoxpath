import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class SelfAxis extends Selector {
	/**
	 * @param  {!../tests/TestAbstractExpression}  selector
	 */
	constructor (selector) {
		super(selector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false
		});

		this._selector = selector;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
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
