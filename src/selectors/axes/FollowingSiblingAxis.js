import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getNextSibling(node);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createNodeValue(node));
		}
	};
}

/**
 * @extends {Selector}
 */
class FollowingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			peer: true,
			subtree: false,
			canBeStaticallyEvaluated: false
		});

		this._siblingSelector = siblingSelector;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

        const domFacade = dynamicContext.domFacade;

		return new Sequence(createSiblingGenerator(domFacade, contextItem.value)).filter(item => {
			return this._siblingSelector.evaluateToBoolean(dynamicContext, item);
		});
	}
}

export default FollowingSiblingAxis;
