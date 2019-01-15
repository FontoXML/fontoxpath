import Expression, { RESULT_ORDERINGS } from '../Expression';

import createNodeValue from '../dataTypes/createNodeValue';
import SequenceFactory from '../dataTypes/sequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, ready } from '../util/iterators';

function createSiblingGenerator(domFacade, node) {
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
	private _siblingExpression: TestAbstractExpression;
	constructor(siblingExpression: TestAbstractExpression) {
		super(siblingExpression.specificity, [siblingExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			peer: true,
			subtree: false,
			canBeStaticallyEvaluated: false
		});

		this._siblingExpression = siblingExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;

		return SequenceFactory.create(createSiblingGenerator(domFacade, contextItem.value)).filter(
			item => {
				return this._siblingExpression.evaluateToBoolean(dynamicContext, item);
			}
		);
	}
}

export default FollowingSiblingAxis;
