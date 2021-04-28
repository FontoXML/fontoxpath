import DomFacade from '../../domFacade/DomFacade';
import Expression, { RESULT_ORDERINGS } from '../Expression';

import { ChildNodePointer, NodePointer } from '../../domClone/Pointer';
import createPointerValue from '../dataTypes/createPointerValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { DONE_TOKEN, ready } from '../util/iterators';

function createSiblingGenerator(domFacade: DomFacade, node: NodePointer, bucket: string | null) {
	return {
		next: () => {
			node = node && domFacade.getNextSiblingPointer(node as ChildNodePointer, bucket);
			if (!node) {
				return DONE_TOKEN;
			}

			return ready(createPointerValue(node, domFacade));
		},
	};
}

class FollowingSiblingAxis extends Expression {
	private _siblingExpression: TestAbstractExpression;
	constructor(siblingExpression: TestAbstractExpression) {
		super(siblingExpression.specificity, [siblingExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			peer: true,
			subtree: false,
			canBeStaticallyEvaluated: false,
		});

		this._siblingExpression = siblingExpression;
	}

	public evaluate(dynamicContext, executionParameters) {
		const contextItem = dynamicContext.contextItem;
		if (contextItem === null) {
			throw new Error('XPDY0002: context is absent, it needs to be present to use axes.');
		}

		return sequenceFactory
			.create(
				createSiblingGenerator(
					executionParameters.domFacade,
					contextItem.value,
					this._siblingExpression.getBucket()
				)
			)
			.filter((item) => {
				return this._siblingExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters
				);
			});
	}
}

export default FollowingSiblingAxis;
