import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import TestAbstractExpression from '../tests/TestAbstractExpression';

/**
 * @extends {Expression}
 */
class ChildAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  childExpression
	 */
	constructor (childExpression) {
		super(
			childExpression.specificity,
			[childExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED,
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
		const childContextSequence = Sequence.create(nodeValues);
		return childContextSequence.filter(item => {
				return this._childExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}
export default ChildAxis;
