import DomFacade from '../../domFacade/DomFacade';
import { compareNodePositions, sortNodeValues } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../dataTypes/Value';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import { DONE_TOKEN, IterationHint, ready } from '../util/iterators';
import arePointersEqual from './compares/arePointersEqual';

function ensureSortedSequence(
	intersectOrExcept: string,
	domFacade: DomFacade,
	sequence: ISequence,
	expectedResultOrder: any
): ISequence {
	return sequence.mapAll((values) => {
		if (values.some((value) => !isSubtypeOf(value.type, ValueType.NODE))) {
			throw new Error(
				`XPTY0004: Sequences given to ${intersectOrExcept} should only contain nodes.`
			);
		}
		if (expectedResultOrder === RESULT_ORDERINGS.SORTED) {
			return sequenceFactory.create(values);
		}
		if (expectedResultOrder === RESULT_ORDERINGS.REVERSE_SORTED) {
			return sequenceFactory.create(values.reverse());
		}

		// Unsorted
		return sequenceFactory.create(sortNodeValues(domFacade, values));
	});
}

/**
 * The 'intersect' expression: intersect and except
 */
class IntersectExcept extends Expression {
	private _expression1: Expression;
	private _expression2: Expression;
	private _intersectOrExcept: string;
	constructor(
		intersectOrExcept: string,
		expression1: Expression,
		expression2: Expression,
		type: SequenceType
	) {
		const maxSpecificity =
			expression1.specificity.compareTo(expression2.specificity) > 0
				? expression1.specificity
				: expression2.specificity;
		super(
			maxSpecificity,
			[expression1, expression2],
			{
				canBeStaticallyEvaluated:
					expression1.canBeStaticallyEvaluated && expression2.canBeStaticallyEvaluated,
			},
			false,
			type
		);

		this._intersectOrExcept = intersectOrExcept;
		this._expression1 = expression1;
		this._expression2 = expression2;
	}

	public evaluate(dynamicContext, executionParameters) {
		const firstResult = ensureSortedSequence(
			this._intersectOrExcept,
			executionParameters.domFacade,
			this._expression1.evaluateMaybeStatically(dynamicContext, executionParameters),
			this._expression1.expectedResultOrder
		);
		const secondResult = ensureSortedSequence(
			this._intersectOrExcept,
			executionParameters.domFacade,
			this._expression2.evaluateMaybeStatically(dynamicContext, executionParameters),
			this._expression2.expectedResultOrder
		);

		const firstIterator = firstResult.value;
		const secondIterator = secondResult.value;

		let firstValue = null;
		let secondValue = null;

		let done = false;
		let secondIteratorDone = false;
		return sequenceFactory.create({
			next: (_hint: IterationHint) => {
				if (done) {
					return DONE_TOKEN;
				}
				while (!secondIteratorDone) {
					if (!firstValue) {
						const itrResult = firstIterator.next(IterationHint.NONE);
						if (itrResult.done) {
							// Since ∅ \ X = ∅ and ∅ ∩ X = ∅, we are done.
							done = true;
							return DONE_TOKEN;
						}
						firstValue = itrResult.value;
					}
					if (!secondValue) {
						const itrResult = secondIterator.next(IterationHint.NONE);
						if (itrResult.done) {
							secondIteratorDone = true;
							break;
						}
						secondValue = itrResult.value;
					}

					if (arePointersEqual(firstValue.value, secondValue.value)) {
						const toReturn = ready(firstValue);
						firstValue = null;
						secondValue = null;
						if (this._intersectOrExcept === 'intersectOp') {
							return toReturn;
						}
						continue;
					}

					const comparisonResult = compareNodePositions(
						executionParameters.domFacade,
						firstValue,
						secondValue
					);
					if (comparisonResult < 0) {
						const toReturn = ready(firstValue);
						firstValue = null;
						if (this._intersectOrExcept === 'exceptOp') {
							return toReturn;
						}
					} else {
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
					return firstIterator.next(IterationHint.NONE);
				}

				// Since X ∩ ∅ = ∅, we are done.
				done = true;
				return DONE_TOKEN;
			},
		});
	}
}
export default IntersectExcept;
