import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class PrecedingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._siblingSelector = siblingSelector;
	}

	/**
	 * @param  {Selector}  otherSelector
	 */
	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof PrecedingSiblingAxis &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem;

		function isMatchingPrecedingSibling (selector, node) {
			return selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
				contextSequence: null
			})).getEffectiveBooleanValue();
		}

		var sibling = contextItem.value[0].value;
		var nodes = [];
		while ((sibling = dynamicContext.domFacade.getPreviousSibling(sibling))) {
			if (!isMatchingPrecedingSibling(this._siblingSelector, sibling)) {
				continue;
			}
			nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
		}
		return new Sequence(nodes);
	}
}

export default PrecedingSiblingAxis;
