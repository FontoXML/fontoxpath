import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class ParentAxis extends Selector {
	/**
	 * @param  {!TestAbstractExpression}  parentSelector
	 */
	constructor (parentSelector) {
		super(
			parentSelector.specificity,
			[parentSelector],
			{
				resultOrder: Selector.RESULT_ORDERINGS.REVERSE_SORTED,
				peer: true,
				subtree: true,
				canBeStaticallyEvaluated: false
			});

		this._parentSelector = parentSelector;
	}

	evaluate (dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const parentNode = domFacade.getParentNode(dynamicContext.contextItem.value);
		if (!parentNode) {
			return Sequence.empty();
		}
		const parentNodeValue = createNodeValue(parentNode);
		const nodeIsMatch = this._parentSelector.evaluateToBoolean(dynamicContext, parentNodeValue);
		if (!nodeIsMatch) {
			return Sequence.empty();
		}
		return Sequence.singleton(parentNodeValue);
	}
}

export default ParentAxis;
