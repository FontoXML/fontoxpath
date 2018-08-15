import Expression from '../Expression';
import Sequence from '../dataTypes/Sequence';
import createNodeValue from '../dataTypes/createNodeValue';
import { DONE_TOKEN, ready } from '../util/iterators';
import TestAbstractExpression from '../tests/TestAbstractExpression';

function createSiblingGenerator (domFacade, node) {
	return {
		next: () => {
			node = node && domFacade.getPreviousSibling(node);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createNodeValue(node));
		}
	};
}

class PrecedingSiblingAxis extends Expression {
	/**
	 * @param  {!TestAbstractExpression}  siblingExpression
	 */
	constructor (siblingExpression) {
		super(
			siblingExpression.specificity,
			[siblingExpression],
			{
				resultOrder: Expression.RESULT_ORDERINGS.REVERSE_SORTED,
				subtree: false,
				peer: true,
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
		return new Sequence(createSiblingGenerator(domFacade, contextItem.value)).filter(item=> {
			return this._siblingExpression.evaluateToBoolean(dynamicContext, item);
		});
	}
}

export default PrecedingSiblingAxis;
