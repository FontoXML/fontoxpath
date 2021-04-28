import Expression, { RESULT_ORDERINGS } from '../Expression';

import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class ParentAxis extends Expression {
	private _parentExpression: TestAbstractExpression;
	constructor(parentExpression: TestAbstractExpression) {
		super(parentExpression.specificity, [parentExpression], {
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			peer: true,
			subtree: true,
			canBeStaticallyEvaluated: false,
		});

		this._parentExpression = parentExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const contextNode = dynamicContext.contextItem.value;
		const parentNode = domFacade.getParentNodePointer(
			contextNode,
			this._parentExpression.getBucket()
		);
		if (!parentNode) {
			return sequenceFactory.empty();
		}
		const parentNodeValue = createPointerValue(parentNode, executionParameters.domFacade);
		const nodeIsMatch = this._parentExpression.evaluateToBoolean(
			dynamicContext,
			parentNodeValue,
			executionParameters
		);
		if (!nodeIsMatch) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(parentNodeValue);
	}
}

export default ParentAxis;
