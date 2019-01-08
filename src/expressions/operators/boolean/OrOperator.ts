import Expression from '../../Expression';
import Specificity from '../../Specificity';
import SequenceFactory from '../../dataTypes/SequenceFactory';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../../util/iterators';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import getBucketsForNode from '../../../getBucketsForNode';

class OrOperator extends Expression {
	private _bucket: string;
	private _subExpressions: Expression[];

	constructor(expressions: Array<Expression>) {
		const maxSpecificity = expressions.reduce((maxSpecificity, selector) => {
			if (maxSpecificity.compareTo(selector.specificity) > 0) {
				return maxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({}));

		super(
			maxSpecificity,
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(selector => selector.canBeStaticallyEvaluated)
			});

		// If all subExpressions define the same bucket: use that one, else, use no bucket.
		let bucket = undefined;
		for (let i = 0; i < expressions.length; ++i) {
			if (bucket === undefined) {
				bucket = expressions[i].getBucket();
			}
			if (bucket === null) {
				// Not applicable buckets
				break;
			}

			if (bucket !== expressions[i].getBucket()) {
				bucket = null;
				break;
			}
		}
		this._bucket = bucket;

		this._subExpressions = expressions;
	}

	evaluate (dynamicContext, executionParameters) {
		let i = 0;
		let resultSequence = null;
		let done = false;

		let contextItemBuckets = null;
		if (dynamicContext !== null) {
			const contextItem = dynamicContext.contextItem;
			if (contextItem !== null && isSubtypeOf(contextItem.type, 'node()')) {
				contextItemBuckets = getBucketsForNode(contextItem.value);
			}
		}

		return SequenceFactory.create({
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
									continue;
								}
							}
							resultSequence = subExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
						}
						const ebv = resultSequence.tryGetEffectiveBooleanValue();
						if (!ebv.ready) {
							return notReady(ebv.promise);
						}
						if (ebv.value === true) {
							done = true;
							return ready(trueBoolean);
						}
						resultSequence = null;
						i++;
					}
					done = true;
					return ready(falseBoolean);
				}
				return DONE_TOKEN;
			}
		});
	}

	getBucket () {
		return this._bucket;
	}
}

export default OrOperator;
