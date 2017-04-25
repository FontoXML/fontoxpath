import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class ChildAxis extends Selector {
	constructor (childSelector) {
		super(childSelector.specificity, {
			resultOrder: Selector.RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true
		});

		this._childSelector = childSelector;

	}

	/**
	 * @param   {../DynamicContext}  dynamicContext
	 * @return  {Sequence}
	 */
	evaluate (dynamicContext) {
		const contextItem = dynamicContext.contextItem;
		const domFacade = dynamicContext.domFacade;
		const nodeValues = domFacade.getChildNodes(contextItem.value).map((node) => new NodeValue(node));
		const childContextSequence = new Sequence(nodeValues);
		return childContextSequence.filter((item, i, sequence) => {
			const childContext = dynamicContext._createScopedContext({
				contextItem: item,
				contextItemIndex: i,
				contextSequence: sequence
			});
			return this._childSelector.evaluate(childContext).getEffectiveBooleanValue();
		});
	}
}
export default ChildAxis;
