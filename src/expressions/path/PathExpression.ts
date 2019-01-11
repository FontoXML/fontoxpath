import Expression, { RESULT_ORDERINGS } from '../Expression';

import Specificity from '../Specificity';
import SequenceFactory from '../dataTypes/SequenceFactory';
import createSingleValueIterator from '../util/createSingleValueIterator';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { sortNodeValues, compareNodePositions } from '../dataTypes/documentOrderUtils';
import { AsyncIterator } from '../util/iterators';
import { ready, notReady, DONE_TOKEN } from '../util/iterators';
import ISequence from '../dataTypes/ISequence';
import DomFacade from '../../domFacade/DomFacade';

function isSameNodeValue(a, b) {
	if (a === null || b === null) {
		return false;
	}
	if (!isSubtypeOf(a.type, 'node()') || !isSubtypeOf(b.type, 'node()')) {
		return false;
	}

	return a.value === b.value;
}

function concatSortedSequences(_, sequences: AsyncIterator<ISequence>): ISequence {
	let currentSequence = sequences.next();
	if (currentSequence.done) {
		return SequenceFactory.empty();
	}
	let currentIterator = null;
	let previousValue = null;
	return SequenceFactory.create({
		next: function() {
			if (!currentSequence.ready) {
				return notReady(
					currentSequence.promise.then(() => {
						currentSequence = sequences.next();
					})
				);
			}
			if (currentSequence.done) {
				return currentSequence;
			}
			if (!currentIterator) {
				currentIterator = currentSequence.value.value;
			}

			let value;
			// Scan to the next value
			do {
				value = currentIterator.next();
				if (!value.ready) {
					return value;
				}
				if (value.done) {
					currentSequence = sequences.next();
					if (currentSequence.done) {
						return value;
					}
					currentIterator = currentSequence.value.value;
				}
			} while (value.done || isSameNodeValue(value.value, previousValue));
			previousValue = value.value;
			return value;
		}
	});
}

function mergeSortedSequences(
	domFacade: DomFacade,
	sequences: AsyncIterator<ISequence>
): ISequence {
	const allIterators = [];
	// Because the sequences are sorted locally, but unsorted globally, we first need to sort all the iterators.
	// For that, we need to know all of them
	let allSequencesLoaded = false;
	let allSequencesLoadedPromise = null;
	(function loadSequences() {
		let val = sequences.next();
		while (!val.done) {
			if (!val.ready) {
				allSequencesLoadedPromise = val.promise.then(loadSequences);
				return allSequencesLoadedPromise;
			}
			const iterator = val.value.value;
			const mappedIterator = {
				current: iterator.next(),
				next: () => iterator.next()
			};
			if (!mappedIterator.current.done) {
				allIterators.push(mappedIterator);
			}
			val = sequences.next();
		}
		allSequencesLoaded = true;
		return undefined;
	})();
	let previousNode = null;

	let allSequencesAreSorted = false;
	return SequenceFactory.create({
		[Symbol.iterator]: function() {
			return this;
		},
		next: () => {
			if (!allSequencesLoaded) {
				return notReady(allSequencesLoadedPromise);
			}

			if (!allSequencesAreSorted) {
				allSequencesAreSorted = true;

				if (
					allIterators.every(iterator =>
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

			let consumedValue;
			do {
				if (!allIterators.length) {
					return DONE_TOKEN;
				}

				const consumedIterator = allIterators.shift();
				consumedValue = consumedIterator.current;
				consumedIterator.current = consumedIterator.next();
				if (!isSubtypeOf(consumedValue.value.type, 'node()')) {
					// Sorting does not matter
					return consumedValue;
				}
				if (!consumedIterator.current.ready) {
					return consumedIterator.current;
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
		}
	});
}

function sortResults(domFacade, result) {
	let resultContainsNodes = false,
		resultContainsNonNodes = false;
	result.forEach(function(resultValue) {
		if (isSubtypeOf(resultValue.type, 'node()')) {
			resultContainsNodes = true;
		} else {
			resultContainsNonNodes = true;
		}
	});
	if (resultContainsNonNodes && resultContainsNodes) {
		throw new Error(
			'XPTY0018: The path operator should either return nodes or non-nodes. Mixed sequences are not allowed.'
		);
	}

	if (resultContainsNodes) {
		return sortNodeValues(domFacade, result);
	}
	return result;
}

class PathExpression extends Expression {
	_stepExpressions: Expression[];
	_requireSortedResults: boolean;

	constructor(stepExpressions: Array<Expression>, requireSortedResults) {
		const pathResultsInPeerSequence = stepExpressions.every(selector => selector.peer);
		const pathResultsInSubtreeSequence = stepExpressions.every(selector => selector.subtree);
		super(
			stepExpressions.reduce(function(specificity, selector) {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			stepExpressions,
			{
				resultOrder: requireSortedResults
					? RESULT_ORDERINGS.SORTED
					: RESULT_ORDERINGS.UNSORTED,
				peer: pathResultsInPeerSequence,
				subtree: pathResultsInSubtreeSequence,
				canBeStaticallyEvaluated: false
			}
		);

		this._stepExpressions = stepExpressions;
		this._requireSortedResults = requireSortedResults;
	}

	getBucket() {
		return this._stepExpressions[0].getBucket();
	}

	evaluate(dynamicContext, executionParameters) {
		let sequenceHasPeerProperty = true;
		const result = this._stepExpressions.reduce((intermediateResultNodesSequence, selector) => {
			let childContextIterator;
			if (intermediateResultNodesSequence === null) {
				// first call, we should use the current dynamic context
				childContextIterator = createSingleValueIterator(dynamicContext);
			} else {
				childContextIterator = dynamicContext.createSequenceIterator(
					intermediateResultNodesSequence
				);
			}
			let resultValuesInOrderOfEvaluation = {
				next: () => {
					const childContext = childContextIterator.next();
					if (!childContext.ready) {
						return childContext;
					}

					if (childContext.done) {
						return childContext;
					}
					if (
						childContext.value.contextItem !== null &&
						!isSubtypeOf(childContext.value.contextItem.type, 'node()')
					) {
						throw new Error(
							'XPTY0019: The / operator can only be applied to xml/json nodes.'
						);
					}
					return ready(
						selector.evaluateMaybeStatically(childContext.value, executionParameters)
					);
				}
			};
			// Assume nicely sorted
			let sortedResultSequence;
			if (!this._requireSortedResults) {
				sortedResultSequence = concatSortedSequences(
					executionParameters.domFacade,
					resultValuesInOrderOfEvaluation
				);
			} else {
				switch (selector.expectedResultOrder) {
					case RESULT_ORDERINGS.REVERSE_SORTED: {
						const resultValuesInReverseOrder = resultValuesInOrderOfEvaluation;
						resultValuesInOrderOfEvaluation = {
							next: () => {
								const result = resultValuesInReverseOrder.next();
								if (!result.ready) {
									return result;
								}
								if (result.done) {
									return result;
								}
								return ready(
									result.value.mapAll(items =>
										SequenceFactory.create(items.reverse())
									)
								);
							}
						};
						// Fallthrough for merges
					}
					case RESULT_ORDERINGS.SORTED:
						if (selector.subtree && sequenceHasPeerProperty) {
							sortedResultSequence = concatSortedSequences(
								executionParameters.domFacade,
								resultValuesInOrderOfEvaluation
							);
							break;
						}
						// Only locally sorted
						sortedResultSequence = mergeSortedSequences(
							executionParameters.domFacade,
							resultValuesInOrderOfEvaluation
						);
						break;
					case RESULT_ORDERINGS.UNSORTED: {
						// The result should be sorted before we can continue
						const concattedSequence = concatSortedSequences(
							executionParameters.domFacade,
							resultValuesInOrderOfEvaluation
						);
						return concattedSequence.mapAll(allValues =>
							SequenceFactory.create(
								sortResults(executionParameters.domFacade, allValues)
							)
						);
					}
				}
			}
			// If this selector returned non-peers, the sequence could be contaminated with ancestor/descendant nodes
			// This makes sorting using concat impossible
			sequenceHasPeerProperty = sequenceHasPeerProperty && selector.peer;
			return sortedResultSequence;
		}, null);

		return result;
	}
}

export default PathExpression;