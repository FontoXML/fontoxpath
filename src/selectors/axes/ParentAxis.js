import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class ParentAxis extends Selector {
	/**
	 * @param  {Selector}  parentSelector
	 */
	constructor (parentSelector) {
		super(parentSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
			peer: true,
			subtree: true
		});

		this._parentSelector = parentSelector;
	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const domFacade = dynamicContext.domFacade;

		const parentNode = domFacade.getParentNode(dynamicContext.contextItem.value);
		if (!parentNode) {
			return Sequence.empty();
		}
		const parentSequence = Sequence.singleton(NodeValue.createFromNode(parentNode));
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextItem: NodeValue.createFromNode(parentNode),
			contextSequence: parentSequence
		});

		const nodeIsMatch = this._parentSelector.evaluate(scopedContext).getEffectiveBooleanValue();
		if (!nodeIsMatch) {
			return Sequence.empty();
		}
		return parentSequence;
	}
}

export default ParentAxis;
