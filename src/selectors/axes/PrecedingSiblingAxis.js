import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getPreviousSibling(node);
			if (!node) {
				return { done: true, ready: true, value: undefined };
			}

			return {
				done: false,
				ready: true,
				value: createNodeValue(node)
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
			peer: true,
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
		const domFacade = dynamicContext.domFacade;

		return new Sequence(createSiblingGenerator(domFacade, contextItem.value)).filter((item, i, sequence) => {
			const result = this._siblingSelector.evaluateMaybeStatically(dynamicContext.scopeWithFocus(i, item, sequence));

			return result.getEffectiveBooleanValue();
		});
	}
}

export default PrecedingSiblingAxis;
