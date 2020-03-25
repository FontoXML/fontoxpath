import IDomFacade from '../../domFacade/IDomFacade';
import { Node } from '../../types/Types';
import Expression, { RESULT_ORDERINGS } from '../Expression';

import createNodeValue from '../dataTypes/createNodeValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, ready } from '../util/iterators';

function createSiblingGenerator(domFacade: IDomFacade, node: Node, bucket: string | null) {
	return {
		next: () => {
			node = node && domFacade.getPreviousSibling(node, bucket);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createNodeValue(node));
		},
	};
}

class PrecedingSiblingAxis extends Expression {
	private _siblingExpression: TestAbstractExpression;
	constructor(siblingExpression: TestAbstractExpression) {
		super(siblingExpression.specificity, [siblingExpression], {
			canBeStaticallyEvaluated: false,
			peer: true,
			resultOrder: RESULT_ORDERINGS.REVERSE_SORTED,
			subtree: false,
		});

		this._siblingExpression = siblingExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		const domFacade = executionParameters.domFacade;
		return sequenceFactory
			.create(
				createSiblingGenerator(
					domFacade,
					contextItem.value,
					this._siblingExpression.getBucket()
				)
			)
			.filter((item) => {
				return this._siblingExpression.evaluateToBoolean(dynamicContext, item);
			});
	}
}

export default PrecedingSiblingAxis;
