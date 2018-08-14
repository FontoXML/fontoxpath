import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import Expression from '../../Expression';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../../util/iterators';

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
		return new Sequence({
			next: () => {
				if (!done) {
					while (i < this._subExpressions.length) {
						if (!resultSequence) {
							resultSequence = this._subExpressions[i].evaluateMaybeStatically(dynamicContext, executionParameters);
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
