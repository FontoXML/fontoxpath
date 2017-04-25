import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

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
				resultOrder: Selector.RESULT_ORDERINGS.UNSORTED
			});
		this._selectors = selectors;

	}

	evaluate (dynamicContext) {
		let i = 0;
		const l = this._selectors.length;
		if (!l) {
			return Sequence.empty();
		}
		let currentValueIterator = this._selectors[i].evaluate(dynamicContext).value();

		return new Sequence({
			next: () => {
				let val = currentValueIterator.next();
				while (val.done) {
					i++;
					if (i >= l) {
						return { done: true };
					}
					currentValueIterator = this._selectors[i].evaluate(dynamicContext).value();
					val = currentValueIterator.next();
				}
				return val;
			}
		});
	}
}

export default SequenceOperator;
