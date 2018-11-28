import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../../util/iterators';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import getBucketsForNode from '../../../getBucketsForNode';

/**
 * @extends {Expression}
 */
class AndOperator extends Expression {
	/**
	 * @param  {!Array<!Expression>}  expressions
	 */
	constructor (expressions) {
		super(
			expressions.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			expressions,
			{
				canBeStaticallyEvaluated: expressions.every(selector => selector.canBeStaticallyEvaluated)
			});
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
		return new Sequence({
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
									done = false;
									return ready(falseBoolean);
								}
							}
							resultSequence = subExpression.evaluateMaybeStatically(dynamicContext, executionParameters);
						}
						const ebv = resultSequence.tryGetEffectiveBooleanValue();
						if (!ebv.ready) {
							return notReady(ebv.promise);
						}
						if (ebv.value === false) {
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
			}
		});
	}

	getBucket () {
		// Any bucket of our subexpressions should do, and is preferable to no bucket
		for (var i = 0, l = this._subExpressions.length; i < l; ++i) {
			var bucket = this._subExpressions[i].getBucket();
			if (bucket) {
				return bucket;
			}
		}
		return null;
	}
}
export default AndOperator;
