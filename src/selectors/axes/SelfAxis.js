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

	evaluate (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem;

		return new Sequence(nodeSequence.value.filter(nodeValue => {
			var contextItem = Sequence.singleton(nodeValue);

			return this._selector.evaluate(dynamicContext.createScopedContext({
				contextItem: contextItem,
				contextSequence: contextItem
			})).getEffectiveBooleanValue();
		}));
	}

	getBucket () {
		return this._selector.getBucket();
	}
}
export default SelfAxis;
