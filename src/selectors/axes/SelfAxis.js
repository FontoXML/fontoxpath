import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @extends {Selector}
 */
class SelfAxis extends Selector {
	/**
	 * @param  {Selector}  selector
	 */
	constructor (selector) {
		super(selector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true
		});

		this._selector = selector;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var isMatch = this._selector.evaluate(dynamicContext).getEffectiveBooleanValue();
		return isMatch ? Sequence.singleton(dynamicContext.contextItem) : Sequence.empty();
	}

	getBucket () {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
