import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class DescendantAxis extends Selector {
	/**
	 * @param  {!Selector}  descendantSelector
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (descendantSelector, options) {
		options = options || { inclusive: false };
		super(descendantSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._descendantSelector = descendantSelector;
		this._isInclusive = !!options.inclusive;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		var descendants = [];
		function collectDescendants (node) {
			descendants.push(new NodeValue(node));
			domFacade.getChildNodes(node).forEach(collectDescendants);
		}

		if (this._isInclusive) {
			collectDescendants(contextItem.value);
		}
		else {
			domFacade.getChildNodes(contextItem.value).forEach(collectDescendants);
		}

		const filteredNodeValues = [];
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextSequence: new Sequence(descendants)
		});

		for (let i = 0, l = descendants.length; i < l; ++i) {
			const nodeIsMatch = this._descendantSelector.evaluate(
				scopedContext.createScopedContext({ contextItemIndex: i }))
					.getEffectiveBooleanValue();
			if (nodeIsMatch) {
				filteredNodeValues.push(descendants[i]);
			}
		}
		return new Sequence(filteredNodeValues);
	}
}
export default DescendantAxis;
