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
		super(parentSelector.specificity, Selector.RESULT_ORDERINGS.REVERSE_SORTED);

		this._parentSelector = parentSelector;
		this._getStringifiedValue = () => `(parent ${this._parentSelector.toString()})`;;
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
		const parentSequence = Sequence.singleton(new NodeValue(parentNode));
		const scopedContext = dynamicContext._createScopedContext({
			contextItemIndex: 0,
			contextItem: new NodeValue(parentNode),
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
