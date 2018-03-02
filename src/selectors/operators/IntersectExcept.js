import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { sortNodeValues, compareNodePositions } from '../dataTypes/documentOrderUtils';
import { DONE_TOKEN, ready } from '../util/iterators';

/**
 * @param  {string}       intersectOrExcept
 * @param  {!IDomFacade}  domFacade
 * @param  {!Sequence}    sequence
 * @param  {number}       expectedResultOrder
 *
 * @return {!Sequence}
 */
function ensureSortedSequence (intersectOrExcept, domFacade, sequence, expectedResultOrder) {
	sequence = sequence.map(value => {
		if (!isSubtypeOf(value.type, 'node()')) {
			throw new Error(`XPTY0004: Sequences given to ${intersectOrExcept} should only contain nodes.`);
		}
		return value;
	});
	if (expectedResultOrder === Selector.RESULT_ORDERINGS.SORTED) {
		return sequence;
	}
	if (expectedResultOrder === Selector.RESULT_ORDERINGS.REVERSE_SORTED) {
		return sequence.mapAll(allItems => new Sequence(allItems.reverse()));
	}

	// Unsorted
	return sequence.mapAll(allItems => new Sequence(sortNodeValues(domFacade, allItems)));
}

/**
 * The 'intersect' expression: intersect and except
 * @extends {Selector}
 */
class IntersectExcept extends Selector {
	/**
	 * @param  {string}     intersectOrExcept
	 * @param  {!Selector}  expression1
	 * @param  {!Selector}  expression2
	 */
	constructor (intersectOrExcept, expression1, expression2) {
		const maxSpecificity = expression1.specificity.compareTo(expression2.specificity) > 0 ?
			expression1.specificity :
			expression2.specificity;
		super(maxSpecificity, {
			canBeStaticallyEvaluated: expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated
		});

		this._intersectOrExcept = intersectOrExcept;
		this._expression1 = expression1;
		this._expression2 = expression2;
	}

	evaluate (dynamicContext) {
		const firstResult = ensureSortedSequence(
			this._intersectOrExcept,
			dynamicContext.domFacade,
			this._expression1.evaluate(dynamicContext),
			this._expression1.expectedResultOrder);
		const secondResult = ensureSortedSequence(
			this._intersectOrExcept,
			dynamicContext.domFacade,
			this._expression2.evaluate(dynamicContext),
			this._expression2.expectedResultOrder);

		const firstIterator = firstResult.value();
		const secondIterator = secondResult.value();

		let firstValue = null;
		let secondValue = null;

		let done = false;
		let secondIteratorDone = false;
		return new Sequence({
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				while (!secondIteratorDone) {
					if (!firstValue) {
						const itrResult = firstIterator.next();
						if (!itrResult.ready) {
							return itrResult;
						}
						if (itrResult.done) {
							// Since ∅ \ X = ∅ and ∅ ∩ X = ∅, we are done.
							done = true;
							return DONE_TOKEN;
						}
						firstValue = itrResult.value;
					}
					if (!secondValue) {
						const itrResult = secondIterator.next();
						if (!itrResult.ready) {
							return itrResult;
						}
						if (itrResult.done) {
							secondIteratorDone = true;
							break;
						}
						secondValue = itrResult.value;
					}

					if (firstValue.value === secondValue.value) {
						const toReturn = ready(firstValue);
						firstValue = null;
						secondValue = null;
						if (this._intersectOrExcept === 'intersect') {
							return toReturn;
						}
						continue;
					}

					const comparisonResult = compareNodePositions(dynamicContext.domFacade, firstValue, secondValue);
					if (comparisonResult < 0) {
						const toReturn = ready(firstValue);
						firstValue = null;
						if (this._intersectOrExcept === 'except') {
							return toReturn;
						}
					}
					else {
						secondValue = null;
					}
				}

				// The second array is empty.
				if (this._intersectOrExcept === 'except') {
					// Since X \ ∅ = X, we can output all items of X
					if (firstValue !== null) {
						const toReturn = ready(firstValue);
						firstValue = null;
						return toReturn;
					}
					return firstIterator.next();
				}

				// Since X ∩ ∅ = ∅, we are done.
				done = true;
				return DONE_TOKEN;
			}
		});
	}
}
export default IntersectExcept;
