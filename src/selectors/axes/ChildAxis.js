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
		this._getStringifiedValue = () => `(child ${this._childSelector.toString()})`;
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
		return new Sequence(function* () {
			for (const childContext of dynamicContext.createSequenceIterator(childContextSequence)) {
				const nodeIsMatch = this._childSelector.evaluate(childContext).getEffectiveBooleanValue();
				if (nodeIsMatch) {
					yield childContext.contextItem;
				}
			}
		}.bind(this));
	}
}
export default ChildAxis;
