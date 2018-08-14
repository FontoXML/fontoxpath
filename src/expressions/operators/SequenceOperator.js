import Expression from '../Expression';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import { DONE_TOKEN } from '../util/iterators';
/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 *
 * @extends {Expression}
 */
class SequenceOperator extends Expression {
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
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED,
				canBeStaticallyEvaluated: expressions.every(selector => selector.canBeStaticallyEvaluated)
			});
		this._expressions = expressions;

	}

	evaluate (dynamicContext, executionParameters) {
		let i = 0;
		if (!this._expressions.length) {
			return Sequence.empty();
		}
		let currentValueIterator = this._expressions[i].evaluateMaybeStatically(dynamicContext, executionParameters).value();

		return new Sequence({
			next: () => {
				let val = currentValueIterator.next();
				while (val.done) {
					i++;
					if (i >= this._expressions.length) {
						return DONE_TOKEN;
					}
					currentValueIterator = this._expressions[i].evaluateMaybeStatically(dynamicContext, executionParameters).value();
					val = currentValueIterator.next();
				}
				return val;
			}
		});
	}
}

export default SequenceOperator;
