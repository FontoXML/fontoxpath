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

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AncestorAxis &&
			this._isInclusive === otherSelector._isInclusive &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector);
	}

	evaluate (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

		// Assume singleton, since axes are only valid in paths
		var contextNode = contextItem.value[0].value;
		var ancestors = [];
		for (var ancestorNode = this._isInclusive ? contextNode : domFacade.getParentNode(contextNode); ancestorNode; ancestorNode = domFacade.getParentNode(ancestorNode)) {
			var isMatchingAncestor = this._ancestorSelector.evaluate(dynamicContext.createScopedContext({
					contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, ancestorNode)),
					contextSequence: null
				})).getEffectiveBooleanValue();

			if (isMatchingAncestor) {
				ancestors.push(ancestorNode);
			}
		}
		return new Sequence(ancestors.map(function (node) {
			return new NodeValue(dynamicContext.domFacade, node);
		}));
	}
}

export default AncestorAxis;
