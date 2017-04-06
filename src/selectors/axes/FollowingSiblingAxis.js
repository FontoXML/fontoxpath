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
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		var sibling = contextItem.value;
		var siblings = [];
		while ((sibling = domFacade.getNextSibling(sibling))) {
			siblings.push(new NodeValue(sibling));
		}
		const filteredNodeValues = [];
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextSequence: new Sequence(siblings)
		});

		for (let i = 0, l = siblings.length; i < l; ++i) {
			const nodeIsMatch = this._siblingSelector.evaluate(
				scopedContext.createScopedContext({ contextItemIndex: i }))
					.getEffectiveBooleanValue();
			if (nodeIsMatch) {
				filteredNodeValues.push(siblings[i]);
			}
		}
		return new Sequence(filteredNodeValues);
	}
}

export default FollowingSiblingAxis;
