import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import {
	sortNodeValues,
	compareNodePositions
} from '../dataTypes/documentOrderUtils';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @param   {!Iterator<!Sequence>}  sequences
 * @return  {!Sequence}
 */
function concatSortedSequences (_, sequences) {
	let currentSequence = sequences.next();
	if (currentSequence.done) {
		return Sequence.empty();
	}
	let currentIterator = currentSequence.value.value();
	let previousValue = null;
	return new Sequence({
		next: function () {
			if (currentSequence.done) {
				return currentSequence;
			}

			let value;
			// Scan to the next value
			do {
				value = currentIterator.next();
				if (value.done) {
					currentSequence = sequences.next();
					if (currentSequence.done) {
						return value;
					}
					currentIterator = currentSequence.value.value();
				}
			} while (value.done || value.value === previousValue);
			previousValue = value.value;
			return value;
		}
	});
}

/**
 * @param   {!IDomFacade}           domFacade
 * @param   {!Iterable<!Sequence>}  sequences
 * @return  {!Sequence}
 */
function mergeSortedSequences (domFacade, sequences) {
	const allSequences = Array.from(sequences);
	var allIterators = allSequences
		.map(seq => {
			/**
			 * @type {Iterator<../dataTypes/Item>}
			 */
			const it = seq.value();
			return {
				current: it.next(),
				next: () => it.next()
			};
		})
		.filter(it => !it.current.done)
		.sort((a, b) => compareNodePositions(domFacade, a.current.value, b.current.value));
	let previousNode = null;
	return new Sequence({
		[Symbol.iterator]: function () { return this; },
		next: () => {
			let consumedValue;
			do {
				if (!allIterators.length) {
					return { done: true };
				}

				const consumedIterator = allIterators.shift();
				consumedValue = consumedIterator.current;
				consumedIterator.current = consumedIterator.next();
				if (!consumedValue.value.instanceOfType('node()')) {
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
						const comparisonResult = compareNodePositions(domFacade, consumedIterator.current.value, otherNode);
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
			} while (previousNode === consumedValue.value);
			previousNode = consumedValue.value;
			return consumedValue;
		}
	});
}

function sortResults (domFacade, result) {
    let resultContainsNodes = false,
        resultContainsNonNodes = false;
    result.forEach(function (resultValue) {
        if (resultValue instanceof NodeValue) {
            resultContainsNodes = true;
        }
		else {
            resultContainsNonNodes = true;
        }
    });
    if (resultContainsNonNodes && resultContainsNodes) {
        throw new Error('XPTY0018: The path operator should either return nodes or non-nodes. Mixed sequences are not allowed.');
    }

    if (resultContainsNodes) {
        return sortNodeValues(domFacade, result);
    }
    return result;
}

/**
 * @extends {Selector}
 */
class PathSelector extends Selector {
	/**
	 * @param  {!Array<!Selector>}  stepSelectors
	 */
	constructor (stepSelectors) {
		super(
			stepSelectors.reduce(function (specificity, selector) {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			{
				resultOrder: Selector.RESULT_ORDERINGS.SORTED,
				peer: false,
				subtree: false
			});

		this._stepSelectors = stepSelectors;

	}

	getBucket () {
		return this._stepSelectors[0].getBucket();
	}

	evaluate (dynamicContext) {
		let sequenceHasPeerProperty = true;
		/**
		 * @type {Sequence}
		 */
		const result = this._stepSelectors.reduce(function (intermediateResultNodesSequence, selector) {
			/**
			 * @type {Iterator<../DynamicContext>}
			 */
			const childContextIterator = dynamicContext.createSequenceIterator(intermediateResultNodesSequence);

			/**
			 * @type {!IteratorIterable<!Sequence>}
			 */
			let resultValuesInOrderOfEvaluation = /** @type {!IteratorIterable<!../dataTypes/Sequence>} */ ({
				[Symbol.iterator]: () => resultValuesInOrderOfEvaluation,
				next: () => {
					const childContext = childContextIterator.next();
					if (childContext.done) {
						return { done: true };
					}
					if (!childContext.value.contextItem.instanceOfType('node()')) {
						throw new Error('XPTY0019: The / operator can only be applied to xml/json nodes.');
					}
					return { done: false, value: selector.evaluate(childContext.value) };
				}
			});
			// Assume nicely sorted
			let sortedResultSequence;
			switch (selector.expectedResultOrder) {
				case Selector.RESULT_ORDERINGS.REVERSE_SORTED: {
					const resultValuesInReverseOrder = resultValuesInOrderOfEvaluation;
					resultValuesInOrderOfEvaluation = /** @type {!IteratorIterable<!../dataTypes/Sequence>} */ ({
						[Symbol.iterator]: () => resultValuesInOrderOfEvaluation,
						next: () => {
							const result = resultValuesInReverseOrder.next();
							if (result.done) {
								return { done: true };
							}
							return { done: false, value: new Sequence(result.value.getAllValues().reverse()) };
						}
					});
					// Fallthrough for merges
				}
				case Selector.RESULT_ORDERINGS.SORTED:
					if (selector.subtree && sequenceHasPeerProperty) {
						sortedResultSequence = concatSortedSequences(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
						break;
					}
					// Only locally sorted
					sortedResultSequence = mergeSortedSequences(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
					break;
				case Selector.RESULT_ORDERINGS.UNSORTED:
					// The result should be sorted before we can continue
					sortedResultSequence = new Sequence(sortResults(
						dynamicContext.domFacade,
						Array.from(resultValuesInOrderOfEvaluation)
							.reduce(
								(allResults, resultSequence) => allResults.concat(resultSequence.getAllValues()),
								[])));

			}
			// If this selector returned non-peers, the sequence could be contaminated with ancestor/descendant nodes
			// This makes sorting using concat impossible
			sequenceHasPeerProperty = sequenceHasPeerProperty && selector.peer;
			return sortedResultSequence;
		}, Sequence.singleton(dynamicContext.contextItem));

		return result;
	}
}

export default PathSelector;
