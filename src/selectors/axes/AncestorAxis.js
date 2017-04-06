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

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		const domFacade = dynamicContext.domFacade;

		const contextNode = contextItem.value;
		const ancestors = [];
		for (let ancestorNode = this._isInclusive ? contextNode : domFacade.getParentNode(contextNode); ancestorNode; ancestorNode = domFacade.getParentNode(ancestorNode)) {
			ancestors.push(new NodeValue(ancestorNode));
		}

		const filteredNodeValues = [];
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextSequence: new Sequence(ancestors)
		});

		for (let i = 0, l = ancestors.length; i < l; ++i) {
			const nodeIsMatch = this._ancestorSelector.evaluate(
				scopedContext.createScopedContext({ contextItemIndex: i }))
					.getEffectiveBooleanValue();
			if (nodeIsMatch) {
				filteredNodeValues.push(ancestors[i]);
			}
		}
		return new Sequence(filteredNodeValues);
	}
}

export default AncestorAxis;
