import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class AncestorAxis extends Selector {
	/**
	 * @param  {Selector}  ancestorSelector
	 * @param  {{inclusive:boolean}=}    options
	 */
	constructor (ancestorSelector, options) {
		options = options || { inclusive: false };
		super(ancestorSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._ancestorSelector = ancestorSelector;
		this._isInclusive = !!options.inclusive;
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		// Assume singleton, since axes are only valid in paths
		var contextNode = contextItem.value[0].value;
		var ancestors = [];
		for (var ancestorNode = this._isInclusive ? contextNode : domFacade.getParentNode(contextNode); ancestorNode; ancestorNode = domFacade.getParentNode(ancestorNode)) {
			ancestors.push(new NodeValue(dynamicContext.domFacade, ancestorNode));
		}
		return new Sequence(ancestors.filter(ancestor => {
			var contextItem = Sequence.singleton(ancestor);
			var scopedContext = dynamicContext.createScopedContext({
				contextItem: contextItem,
				contextSequence: contextItem
			});
			return this._ancestorSelector.evaluate(scopedContext).getEffectiveBooleanValue();
		}));
	}
}

export default AncestorAxis;
