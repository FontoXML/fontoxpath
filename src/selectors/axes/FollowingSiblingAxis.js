import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getNextSibling(node);
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
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		return new Sequence(createSiblingGenerator(domFacade, contextItem.value)).filter((item, i, sequence) => {
			const result = this._siblingSelector.evaluateMaybeStatically(dynamicContext.scopeWithFocus(i, item, sequence));

			return result.getEffectiveBooleanValue();
		});
	}
}

export default FollowingSiblingAxis;
