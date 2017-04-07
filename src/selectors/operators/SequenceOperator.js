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
			Selector.RESULT_ORDERINGS.UNSORTED);
		this._selectors = selectors;
	}

	toString () {
		if (!this._stringifiedValue) {
			this._stringifiedValue = `(sequence ${this._selectors.map(selector => selector.toString()).join(' ')})`;
		}

		return this._stringifiedValue;
	}

	evaluate (dynamicContext) {
		return this._selectors.reduce(function (accum, selector) {
			return accum.merge(selector.evaluate(dynamicContext));
		}, new Sequence());
	}
}

export default SequenceOperator;
