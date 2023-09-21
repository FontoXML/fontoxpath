import { ChildNodePointer, NodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import createPointerValue from '../dataTypes/createPointerValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { Bucket, intersectBuckets } from '../util/Bucket';
import { DONE_TOKEN, ready } from '../util/iterators';
import validateContextNode from './validateContextNode';

function createSiblingGenerator(domFacade: DomFacade, node: NodePointer, bucket: Bucket | null) {
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
	private readonly _filterBucket: Bucket;
	private readonly _siblingExpression: TestAbstractExpression;
	constructor(siblingExpression: TestAbstractExpression, filterBucket: Bucket) {
		super(siblingExpression.specificity, [siblingExpression], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			peer: true,
			subtree: false,
			canBeStaticallyEvaluated: false,
		});

		this._siblingExpression = siblingExpression;
		this._filterBucket = intersectBuckets(this._siblingExpression.getBucket(), filterBucket);
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
	): ISequence {
		const domFacade = executionParameters.domFacade;
		const contextPointer = validateContextNode(dynamicContext.contextItem);

		return sequenceFactory
			.create(createSiblingGenerator(domFacade, contextPointer, this._filterBucket))
			.filter((item) => {
				return this._siblingExpression.evaluateToBoolean(
					dynamicContext,
					item,
					executionParameters,
				);
			});
	}
}

export default FollowingSiblingAxis;
