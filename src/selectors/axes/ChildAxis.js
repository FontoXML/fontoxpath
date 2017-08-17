import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';

/**
 * @extends {Selector}
 */
class ChildAxis extends Selector {
	/**
	 * @param  {!../tests/TestAbstractExpression}  childSelector
	 */
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
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}
		const domFacade = dynamicContext.domFacade;
		const nodeValues = domFacade.getChildNodes(contextItem.value).map(createNodeValue);
		const childContextSequence = new Sequence(nodeValues);
		return childContextSequence.filter(item => {
				return this._childSelector.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default ChildAxis;
