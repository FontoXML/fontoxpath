import isSameSetOfSelectors from '../../isSameSetOfSelectors';
import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import BooleanValue from '../../dataTypes/BooleanValue';
import Selector from '../../Selector';

/**
 * @extends {Selector}
 */
class AndOperator extends Selector {
	/**
	 * @param  {!Array<!Selector>}  selectors
	 */
	constructor (selectors) {
		super(
			selectors.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			Selector.RESULT_ORDERINGS.SORTED);
		this._subSelectors = selectors;
	}

	equals (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AndOperator &&
			isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
	}

	evaluate (dynamicContext) {
		var result = this._subSelectors.every(function (subSelector) {
				return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
			});

		return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	getBucket () {
		// Any bucket of our subselectors should do, and is preferable to no bucket
		for (var i = 0, l = this._subSelectors.length; i < l; ++i) {
			var bucket = this._subSelectors[i].getBucket();
			if (bucket) {
				return bucket;
			}
		}
		return null;
	}
}
export default AndOperator;
