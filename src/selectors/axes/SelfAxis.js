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
		super(selector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._selector = selector;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof SelfAxis &&
			this._selector.equals(otherSelector._selector);
	}

	evaluate (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem;

		return new Sequence(nodeSequence.value.filter(function (nodeValue) {
			return this._selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(nodeValue),
				contextSequence: nodeSequence
			})).getEffectiveBooleanValue();
		}.bind(this)));
	}

	getBucket () {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
