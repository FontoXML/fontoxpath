import Expression from '../Expression';
import DomFacade from '../../DomFacade';
import Sequence from '../dataTypes/Sequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { sortNodeValues, compareNodePositions } from '../dataTypes/documentOrderUtils';
import { DONE_TOKEN, ready } from '../util/iterators';


/**
 * @param  {string}       intersectOrExcept
 * @param  {!DomFacade}   domFacade
 * @param  {!Sequence}    sequence
 * @param  {?}            expectedResultOrder
 *
 * @return {!Sequence}
 */
function ensureSortedSequence (intersectOrExcept, domFacade, sequence, expectedResultOrder) {
	return sequence.mapAll(values => {
		if (values.some(value => !isSubtypeOf(value.type, 'node()'))) {
			throw new Error(`XPTY0004: Sequences given to ${intersectOrExcept} should only contain nodes.`);
		}
		if (expectedResultOrder === Expression.RESULT_ORDERINGS.SORTED) {
			return new Sequence(values);

		}
		if (expectedResultOrder === Expression.RESULT_ORDERINGS.REVERSE_SORTED) {
			return new Sequence(values.reverse());
		}

		// Unsorted
		return new Sequence(sortNodeValues(domFacade, values));
	});
}

/**
 * The 'intersect' expression: intersect and except
 */
class IntersectExcept extends Expression {
	/**
	 * @param  {string}     intersectOrExcept
	 * @param  {!Expression}  expression1
	 * @param  {!Expression}  expression2
	 */
	constructor (intersectOrExcept, expression1, expression2) {
		const maxSpecificity = expression1.specificity.compareTo(expression2.specificity) > 0 ?
			expression1.specificity :
			expression2.specificity;
		super(
			maxSpecificity,
			[expression1, expression2],
			{
				canBeStaticallyEvaluated: expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated
			}
		);

		this._intersectOrExcept = intersectOrExcept;
		this._expression1 = expression1;
		this._expression2 = expression2;
	}

	evaluate (dynamicContext, executionParameters) {
		const firstResult = ensureSortedSequence(
			this._intersectOrExcept,
			executionParameters.domFacade,
			this._expression1.evaluateMaybeStatically(dynamicContext, executionParameters),
			this._expression1.expectedResultOrder);
		const secondResult = ensureSortedSequence(
			this._intersectOrExcept,
			executionParameters.domFacade,
			this._expression2.evaluateMaybeStatically(dynamicContext, executionParameters),
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
						if (this._intersectOrExcept === 'intersectOp') {
							return toReturn;
						}
						continue;
					}

					const comparisonResult = compareNodePositions(executionParameters.domFacade, firstValue, secondValue);
					if (comparisonResult < 0) {
						const toReturn = ready(firstValue);
						firstValue = null;
						if (this._intersectOrExcept === 'exceptOp') {
							return toReturn;
						}
					}
					else {
						secondValue = null;
					}
				}

				// The second array is empty.
				if (this._intersectOrExcept === 'exceptOp') {
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
