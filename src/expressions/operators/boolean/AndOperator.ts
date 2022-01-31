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
import { Bucket, intersectBuckets } from '../../util/Bucket';
import { DONE_TOKEN, ready } from '../../util/iterators';

class AndOperator extends Expression {
	private readonly _bucket: Bucket | null;
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
		this._bucket = expressions.reduce<Bucket | null>(
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

	public override getBucket(): Bucket {
		return this._bucket;
	}
}
export default AndOperator;
