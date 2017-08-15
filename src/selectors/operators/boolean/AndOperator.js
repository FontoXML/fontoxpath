import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import Selector from '../../Selector';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../../util/iterators';

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
		let i = 0;
		let resultSequence = null;
		let done = false;
		return new Sequence({
			next: () => {
				if (!done) {
					while (i < this._subSelectors.length) {
						if (!resultSequence) {
							resultSequence = this._subSelectors[i].evaluateMaybeStatically(dynamicContext);
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
