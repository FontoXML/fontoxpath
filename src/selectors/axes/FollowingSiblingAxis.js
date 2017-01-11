import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class FollowingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._siblingSelector = siblingSelector;
	}

	/**
	 * @param   {Selector}  otherSelector
	 * @return  {boolean}
	 */
	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof FollowingSiblingAxis &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		function isMatchingFollowingSibling (selector, node) {
			return selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
				contextSequence: null
			})).getEffectiveBooleanValue();
		}

		var sibling = contextItem.value[0].value;
		var nodes = [];
		while ((sibling = domFacade.getNextSibling(sibling))) {
			if (!isMatchingFollowingSibling(this._siblingSelector, sibling)) {
				continue;
			}
			nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
		}
		return new Sequence(nodes);
	}
}

export default FollowingSiblingAxis;
