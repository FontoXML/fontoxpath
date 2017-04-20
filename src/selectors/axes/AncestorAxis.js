import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

function generateAncestors (domFacade, contextNode) {
	let ancestor = contextNode;
	return {
		next: () => {
			if (!ancestor) {
				return { done: true };
			}
			const previousAncestor = ancestor;
			ancestor = previousAncestor && domFacade.getParentNode(previousAncestor);

			return {
				done: false,
				value: NodeValue.createFromNode(previousAncestor)
			};
		}
	};
}

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
		super(ancestorSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
			peer: false,
			subtree: false
		});

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
		return new Sequence(generateAncestors(domFacade, this._isInclusive ? contextNode : domFacade.getParentNode(contextNode)))
			.filter((item, i, sequence) => {
				const ancestorContext = dynamicContext.createScopedContext({
					contextItem: item,
					contextItemIndex: i,
					contextSequence: sequence
				});
				return this._ancestorSelector.evaluate(ancestorContext).getEffectiveBooleanValue();
			});
	}
}

export default AncestorAxis;
