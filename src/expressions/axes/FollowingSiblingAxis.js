import Expression from '../Expression';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';
import TestAbstractExpression from '../tests/TestAbstractExpression';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getNextSibling(node);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createNodeValue(node));
		}
	};
}

class FollowingSiblingAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  siblingExpression
	 */
	constructor (siblingExpression) {
		super(
			siblingExpression.specificity,
			[siblingExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.SORTED,
				peer: true,
				subtree: false,
				canBeStaticallyEvaluated: false
			});

		this._siblingExpression = siblingExpression;

	}

	evaluate (dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		return SequenceFactory.create(createSiblingGenerator(domFacade, contextItem.value)).filter(item => {
			return this._siblingExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}

export default FollowingSiblingAxis;
