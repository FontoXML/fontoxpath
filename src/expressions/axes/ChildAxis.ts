import Expression, { RESULT_ORDERINGS } from '../Expression';

import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class ChildAxis extends Expression {
	_childExpression: TestAbstractExpression;
	constructor(childExpression: TestAbstractExpression) {
		super(
			childExpression.specificity,
			[childExpression],
			{
				resultOrder: RESULT_ORDERINGS.SORTED,
				subtree: true,
				peer: true,
				canBeStaticallyEvaluated: false
			});

		this._childExpression = childExpression;
	}

	evaluate (dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}
		const domFacade = executionParameters.domFacade;
		const /** !Node */ contextNode = contextItem.value;
		const nodeValues = domFacade.getChildNodes(contextNode).map(createNodeValue);
		const childContextSequence = SequenceFactory.create(nodeValues);
		return childContextSequence.filter(item => {
				return this._childExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default ChildAxis;
