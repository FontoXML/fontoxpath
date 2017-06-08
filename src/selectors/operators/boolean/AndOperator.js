import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import createAtomicValue from '../../dataTypes/createAtomicValue';

/**
 * @extends {Selector}
 */
class AndOperator extends Selector {
	/**
	 * @param  {!Array<!Selector>}  selectors
	 */
	constructor (selectors) {
		super(selectors.reduce(function (specificity, selector) {
				return specificity.add(selector.specificity);
		}, new Specificity({})), {
			canBeStaticallyEvaluated: selectors.every(selector => selector.canBeStaticallyEvaluated)
		});
		this._subSelectors = selectors;
	}

	evaluate (dynamicContext) {
		var result = this._subSelectors.every(function (subSelector) {
			return subSelector.evaluateMaybeStatically(dynamicContext).getEffectiveBooleanValue();
			});

		return Sequence.singleton(createAtomicValue(result, 'xs:boolean'));
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
