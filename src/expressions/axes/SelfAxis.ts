import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import TestAbstractExpression from '../tests/TestAbstractExpression';
import { Bucket, intersectBuckets } from '../util/Bucket';
import validateContextNode from './validateContextNode';

class SelfAxis extends Expression {
	private readonly _bucket: Bucket;
	private readonly _selector: TestAbstractExpression;

	constructor(selector: TestAbstractExpression, filterBucket: Bucket) {
		super(selector.specificity, [selector], {
			resultOrder: RESULT_ORDERINGS.SORTED,
			subtree: true,
			peer: true,
			canBeStaticallyEvaluated: false,
		});

		this._selector = selector;
		this._bucket = intersectBuckets(this._selector.getBucket(), filterBucket);
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters,
	): ISequence {
		validateContextNode(dynamicContext.contextItem);

		const isMatch = this._selector.evaluateToBoolean(
			dynamicContext,
			dynamicContext.contextItem,
			executionParameters,
		);
		return isMatch
			? sequenceFactory.singleton(dynamicContext.contextItem)
			: sequenceFactory.empty();
	}

	public override getBucket(): Bucket {
		return this._bucket;
	}
}
export default SelfAxis;
