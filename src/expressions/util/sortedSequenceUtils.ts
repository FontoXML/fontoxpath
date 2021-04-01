import DomFacade from '../../domFacade/DomFacade';
import { compareNodePositions } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import arePointersEqual from '../operators/compares/arePointersEqual';
import { DONE_TOKEN, IIterator, IterationHint, IterationResult } from './iterators';

interface IMappedIterator extends IIterator<Value> {
	current: IterationResult<Value>;
}

function isSameNodeValue(a: Value, b: Value) {
	if (a === null || b === null) {
		return false;
	}
	if (!isSubtypeOf(a.type, 'node()') || !isSubtypeOf(b.type, 'node()')) {
		return false;
	}

	return arePointersEqual(a.value, b.value);
}

/**
 * Concat one or more sorted sequences. Sequences here MUST be globally sorted: the last item of
 * sequence n must be equal to or before the first item of sequence n + 1. Also deduplicates.
 *
 * @param domFacade The domFacade to use to compare node positions
 * @param sequences The sequences to sort. MUST be locally sorted
 */
function concatSortedSequences(sequences: IIterator<ISequence>): ISequence {
	let currentSequence = sequences.next(IterationHint.NONE);
	if (currentSequence.done) {
		return sequenceFactory.empty();
	}
	let currentIterator: IIterator<Value> = null;
	let previousValue: Value = null;
	return sequenceFactory.create({
		next(hint: IterationHint) {
			if (currentSequence.done) {
				return DONE_TOKEN;
			}
			if (!currentIterator) {
				currentIterator = currentSequence.value.value;
			}

			let value: IterationResult<Value>;
			// Scan to the next value
			do {
				value = currentIterator.next(hint);
				if (value.done) {
					currentSequence = sequences.next(IterationHint.NONE);
					if (currentSequence.done) {
						return value;
					}
					currentIterator = currentSequence.value.value;
				}
			} while (value.done || isSameNodeValue(value.value, previousValue));
			previousValue = value.value;
			return value;
		},
	});
}

/**
 * Merge one or more sorted sequences. Sequences here MUST be locally sorted.
 *
 * @param domFacade The domFacade to use to compare node positions
 * @param sequences The sequences to sort. MUST be locally sorted
 */
function mergeSortedSequences(domFacade: DomFacade, sequences: IIterator<ISequence>): ISequence {
	const allIterators: IMappedIterator[] = [];
	// Because the sequences are sorted locally, but unsorted globally, we first need to sort all the iterators.
	// For that, we need to know all of them
	(function loadSequences() {
		let val = sequences.next(IterationHint.NONE);
		while (!val.done) {
			const iterator = val.value.value;
			const mappedIterator: IMappedIterator = {
				current: iterator.next(IterationHint.NONE),
				next: (hint: IterationHint) => iterator.next(hint),
			};
			if (!mappedIterator.current.done) {
				allIterators.push(mappedIterator);
			}
			val = sequences.next(IterationHint.NONE);
		}
	})();
	let previousNode = null;

	let allSequencesAreSorted = false;
	return sequenceFactory.create({
		[Symbol.iterator]() {
			return this;
		},
		next: (_hint: IterationHint) => {
			if (!allSequencesAreSorted) {
				allSequencesAreSorted = true;

				if (
					allIterators.every((iterator) =>
						isSubtypeOf(iterator.current.value.type, 'node()')
					)
				) {
					// Sort the iterators initially. We know these iterators return locally sorted items, but we do not know the inter-ordering of these items.
					allIterators.sort((iteratorA, iteratorB) =>
						compareNodePositions(
							domFacade,
							iteratorA.current.value,
							iteratorB.current.value
						)
					);
				}
			}

			let consumedValue: IterationResult<Value>;
			do {
				if (!allIterators.length) {
					return DONE_TOKEN;
				}

				const consumedIterator = allIterators.shift();
				consumedValue = consumedIterator.current;
				consumedIterator.current = consumedIterator.next(IterationHint.NONE);
				if (!isSubtypeOf(consumedValue.value.type, 'node()')) {
					// Sorting does not matter
					return consumedValue;
				}
				if (!consumedIterator.current.done) {
					// Make the iterators sorted again
					let low = 0;
					let high = allIterators.length - 1;
					let mid = 0;
					while (low <= high) {
						mid = Math.floor((low + high) / 2);
						const otherNode = allIterators[mid].current.value;
						const comparisonResult = compareNodePositions(
							domFacade,
							consumedIterator.current.value,
							otherNode
						);
						if (comparisonResult === 0) {
							// The same, this should be 0
							low = mid;
							break;
						}
						if (comparisonResult > 0) {
							// After:
							low = mid + 1;
							continue;
						}
						high = mid - 1;
					}
					allIterators.splice(low, 0, consumedIterator);
				}
			} while (isSameNodeValue(consumedValue.value, previousNode));
			previousNode = consumedValue.value;
			return consumedValue;
		},
	});
}

export { mergeSortedSequences, concatSortedSequences };
