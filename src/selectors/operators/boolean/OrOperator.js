import Selector from '../../Selector';
import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import BooleanValue from '../../dataTypes/BooleanValue';

/**
 * @extends {Selector}
 */
class OrOperator extends Selector {
	/**
	 * @param  {!Array<!Selector>}  selectors
	 */
	constructor (selectors) {
		const maxSpecificity = selectors.reduce((maxSpecificity, selector) => {
			if (maxSpecificity.compareTo(selector.specificity) > 0) {
				return maxSpecificity;
			}
			return selector.specificity;
		}, new Specificity({}));

		super(maxSpecificity, Selector.RESULT_ORDERINGS.SORTED);

		// If all subSelectors define the same bucket: use that one, else, use no bucket.
		this._bucket = selectors.reduce(function (bucket, selector) {
			if (bucket === undefined) {
				return selector.getBucket();
			}
			if (bucket === null) {
				return null;
			}

			if (bucket !== selector.getBucket()) {
				return null;
			}

			return bucket;
		}, undefined);

		this._subSelectors = selectors;
		this._getStringifiedValue = () => `(or ${this._subSelectors.map(selector => selector.toString()).join(' ')})`;
	}

	evaluate (dynamicContext) {
		var result = this._subSelectors.some(function (subSelector) {
				return subSelector.evaluate(dynamicContext).getEffectiveBooleanValue();
			});

		return Sequence.singleton(result ? BooleanValue.TRUE : BooleanValue.FALSE);
	}

	getBucket () {
		return this._bucket;
	}
}

export default OrOperator;
