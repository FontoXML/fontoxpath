import Expression from '../Expression';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import TestAbstractExpression from '../tests/TestAbstractExpression';

class ParentAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  parentExpression
	 */
	constructor (parentExpression) {
		super(
			parentExpression.specificity,
			[parentExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.REVERSE_SORTED,
				peer: true,
				subtree: true,
				canBeStaticallyEvaluated: false
			});

		this._parentExpression = parentExpression;
	}

	evaluate (dynamicContext, executionParameters) {
		if (dynamicContext.contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		const /** !Node */ contextNode = dynamicContext.contextItem.value;
		const parentNode = domFacade.getParentNode(contextNode);
		if (!parentNode) {
			return SequenceFactory.empty();
		}
		const parentNodeValue = createNodeValue(parentNode);
		const nodeIsMatch = this._parentExpression.evaluateToBoolean(dynamicContext, parentNodeValue);
		if (!nodeIsMatch) {
			return SequenceFactory.empty();
		}
		return SequenceFactory.singleton(parentNodeValue);
	}
}

export default ParentAxis;
