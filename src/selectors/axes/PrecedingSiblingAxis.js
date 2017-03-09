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
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		var sibling = contextItem.value[0].value;
		var siblings = [];
		while ((sibling = domFacade.getPreviousSibling(sibling))) {
			siblings.push(new NodeValue(domFacade, sibling));
		}
		var matchingSiblings = siblings
			.filter((siblingNode) => {
				var contextItem = Sequence.singleton(siblingNode);
				var scopedContext = dynamicContext.createScopedContext({
					contextItem: contextItem,
					contextSequence: contextItem
				});
				return this._siblingSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			});

		return new Sequence(matchingSiblings);
	}
}

export default PrecedingSiblingAxis;
