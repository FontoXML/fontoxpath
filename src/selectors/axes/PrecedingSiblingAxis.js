import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getPreviousSibling(node);
			if (!node) {
				return { done: true };
			}

			return {
				value: NodeValue.createFromNode(node),
				done: false
			};
		}
	};
}

/**
 * @extends {Selector}
 */
class PrecedingSiblingAxis extends Selector {
	/**
	 * @param  {Selector}  siblingSelector
	 */
	constructor (siblingSelector) {
		super(siblingSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: false,
			peer: true
		});

		this._siblingSelector = siblingSelector;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const  contextItem = dynamicContext.contextItem;
		const domFacade = dynamicContext.domFacade;

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

export default PrecedingSiblingAxis;
