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
			peer: true,
			canBeStaticallyEvaluated: false
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
		const nodeValues = domFacade.getChildNodes(contextItem.value).map(NodeValue.createFromNode);
		const childContextSequence = new Sequence(nodeValues);
		return childContextSequence.filter((item, i, sequence) => {
			const childContext = dynamicContext.createScopedContext({
				contextItem: item,
				contextItemIndex: i,
				contextSequence: sequence
			});
			return this._childSelector.evaluateMaybeStatically(childContext).getEffectiveBooleanValue();
		});
	}
}
export default ChildAxis;
