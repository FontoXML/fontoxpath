import Selector from '../../Selector';
import Specificity from '../../Specificity';
import Sequence from '../../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../../dataTypes/createAtomicValue';

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

		super(maxSpecificity, {
			canBeStaticallyEvaluated: selectors.every(selector => selector.canBeStaticallyEvaluated)
		});

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
							return { done: false, ready: false, promise: ebv.promise };
						}
						if (ebv.value === true) {
							done = true;
							return { done: false, ready: true, value: trueBoolean };
						}
						resultSequence = null;
						i++;
					}
					done = true;
					return { done: false, ready: true, value: falseBoolean };
				}
				return { done: true, ready: true };
			}
		});
	}

	getBucket () {
		return this._bucket;
	}
}

export default OrOperator;
