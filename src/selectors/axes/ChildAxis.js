import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @extends {Selector}
 */
class ChildAxis extends Selector {
	constructor (childSelector) {
		super(childSelector.specificity, Selector.RESULT_ORDERINGS.SORTED);

		this._childSelector = childSelector;
	}

	toString () {
		return `(child ${this._childSelector.toString()})`;
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
		const filteredNodeValues = [];
		const scopedContext = dynamicContext.createScopedContext({
			contextItemIndex: 0,
			contextSequence: childContextSequence
		});
		for (let i = 0, l = nodeValues.length; i < l; ++i) {
			const nodeIsMatch = this._childSelector.evaluate(
				scopedContext.createScopedContext({ contextItemIndex: i }))
					.getEffectiveBooleanValue();
			if (nodeIsMatch) {
				filteredNodeValues.push(nodeValues[i]);
			}
		}
		return new Sequence(filteredNodeValues);
	}
}
export default ChildAxis;
