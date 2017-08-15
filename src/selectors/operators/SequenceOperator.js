import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import { DONE_TOKEN } from '../util/iterators';
/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 *
 * @extends {Selector}
 */
class SequenceOperator extends Selector {
	/**
	 * @param  {!Array<!Selector>}  selectors
	 */
	constructor (selectors) {
		super(
			selectors.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			{
				resultOrder: Selector.RESULT_ORDERINGS.UNSORTED,
				canBeStaticallyEvaluated: selectors.every(selector => selector.canBeStaticallyEvaluated)
			});
		this._selectors = selectors;

	}

	evaluate (dynamicContext) {
		let i = 0;
		if (!this._selectors.length) {
			return Sequence.empty();
		}
		let currentValueIterator = this._selectors[i].evaluateMaybeStatically(dynamicContext).value();

		return new Sequence({
			next: () => {
				let val = currentValueIterator.next();
				while (val.done) {
					i++;
					if (i >= this._selectors.length) {
						return DONE_TOKEN;
					}
					currentValueIterator = this._selectors[i].evaluateMaybeStatically(dynamicContext).value();
					val = currentValueIterator.next();
				}
				return val;
			}
		});
	}
}

export default SequenceOperator;
