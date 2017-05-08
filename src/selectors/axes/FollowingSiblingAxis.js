import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getNextSibling(node);
			if (!node) {
				return { done: true };
			}

			return {
				value: new NodeValue(node),
				done: false
			};
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
			subtree: false
		});

		this._siblingSelector = siblingSelector;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		return new Sequence(createSiblingGenerator(domFacade, contextItem.value)).filter((item, i, sequence) => {
			const result = this._siblingSelector.evaluate(dynamicContext.createScopedContext({
				contextSequence: sequence,
				contextItemIndex: i,
				contextItem: item
			}));

			return result.getEffectiveBooleanValue();
		});
	}
}

export default FollowingSiblingAxis;
