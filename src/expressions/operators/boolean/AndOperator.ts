import { NodePointer } from '../../../domClone/Pointer';
import { getBucketsForPointer } from '../../../getBuckets';
import { falseBoolean, trueBoolean } from '../../dataTypes/createAtomicValue';
import ISequence from '../../dataTypes/ISequence';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';
import Specificity from '../../Specificity';
import { DONE_TOKEN, ready } from '../../util/iterators';

// Some buckets include others. For the purpose of determining their intersection, this lists
// "subtypes" per bucket, with all name-* buckets collapsed into "name".
// Note that although "name" is not a strict subtype of either "type-1" or "type-2", it is generally
// more specific than the type-based ones, so we consider it a subtype of both.
const subBucketsByBucket: Record<string, string[]> = {
	'type-1-or-type-2': ['name', 'type-1', 'type-2'],
	'type-1': ['name'],
	'type-2': ['name'],
};

function intersectBuckets(bucket1: string | null, bucket2: string | null): string | null {
	// null bucket applies to everything
	if (bucket1 === null) {
		return bucket2;
	}
	if (bucket2 === null) {
		return bucket1;
	}
	// Same bucket is same
	if (bucket1 === bucket2) {
		return bucket1;
	}
	// Find the more specific one, given that the buckets are not equal
	const type1 = bucket1.startsWith('name-') ? 'name' : bucket1;
	const type2 = bucket2.startsWith('name-') ? 'name' : bucket2;
	const subtypes1 = subBucketsByBucket[type1];
	if (subtypes1 !== undefined && subtypes1.includes(type2)) {
		// bucket 2 is more specific
		return bucket2;
	}
	const subtypes2 = subBucketsByBucket[type2];
	if (subtypes2 !== undefined && subtypes2.includes(type1)) {
		// bucket 1 is more specific
		return bucket1;
	}

	// Expression will never match any nodes
	return 'empty';
}

class AndOperator extends Expression {
	private readonly _bucket: string | null;
	private readonly _subExpressions: Expression[];
	constructor(expressions: Expression[], type: SequenceType) {
		super(
			expressions.reduce((specificity, selector) => {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(
					(selector) => selector.canBeStaticallyEvaluated
				),
			},
			false,
			type
		);
		this._subExpressions = expressions;
		this._bucket = expressions.reduce<string | null>(
			(bucket, expression) => intersectBuckets(bucket, expression.getBucket()),
			null
		);
	}

	public evaluate(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): ISequence {
		let i = 0;
		let resultSequence: ISequence = null;
		let done = false;
		let contextItemBuckets: string[] | null = null;
		if (dynamicContext !== null) {
			const contextItem = dynamicContext.contextItem;
			if (contextItem !== null && isSubtypeOf(contextItem.type, ValueType.NODE)) {
				contextItemBuckets = getBucketsForPointer(
					contextItem.value as NodePointer,
					executionParameters.domFacade
				);
			}
		}
		return sequenceFactory.create({
			next: () => {
				if (!done) {
					while (i < this._subExpressions.length) {
						if (!resultSequence) {
							const subExpression = this._subExpressions[i];
							if (contextItemBuckets !== null && subExpression.getBucket() !== null) {
								if (!contextItemBuckets.includes(subExpression.getBucket())) {
									// This subExpression may NEVER match the given node
									// We do not even have to evaluate the expression
									i++;
									done = true;
									return ready(falseBoolean);
								}
							}
							resultSequence = subExpression.evaluateMaybeStatically(
								dynamicContext,
								executionParameters
							);
						}
						const ebv = resultSequence.getEffectiveBooleanValue();
						if (ebv === false) {
							done = true;
							return ready(falseBoolean);
						}
						resultSequence = null;
						i++;
					}
					done = true;
					return ready(trueBoolean);
				}
				return DONE_TOKEN;
			},
		});
	}

	public getBucket() {
		return this._bucket;
	}
}
export default AndOperator;
