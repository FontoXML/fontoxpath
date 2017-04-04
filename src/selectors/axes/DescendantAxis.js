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

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		var descendants = [];
		function collectDescendants (node) {
			descendants.push(new NodeValue(node));
			domFacade.getChildNodes(node).forEach(collectDescendants);
		}

		if (this._isInclusive) {
			collectDescendants(contextItem.value[0].value);
		}
		else {
			domFacade.getChildNodes(contextItem.value[0].value).forEach(collectDescendants);
		}

		var matchingDescendants = descendants
			.filter(descendant => {
				var contextItem = Sequence.singleton(descendant);
				var scopedContext = dynamicContext.createScopedContext({
					contextItem: contextItem,
					contextSequence: contextItem
				});
				return this._descendantSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			});
		return new Sequence(matchingDescendants);
	}
}
export default DescendantAxis;
