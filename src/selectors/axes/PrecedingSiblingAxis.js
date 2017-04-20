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
				value: new NodeValue(node),
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
		super(siblingSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._siblingSelector = siblingSelector;
		this._getStringifiedValue = () => `(following-sibling ${this._siblingSelector.toString()})`;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		const siblingSelector = this._siblingSelector;
		return new Sequence(() => createSiblingGenerator(domFacade, contextItem.value)).filter((item, i, sequence) => {
			const result = siblingSelector.evaluate(dynamicContext._createScopedContext({
				contextSequence: sequence,
				contextItemIndex: i,
				contextItem: item
			}));

			return result.getEffectiveBooleanValue();
		});
	}
}

export default PrecedingSiblingAxis;
