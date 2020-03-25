import Expression, { RESULT_ORDERINGS } from '../Expression';

import IWrappingDomFacade from '../../domFacade/IWrappingDomFacade';
import { compareNodePositions, sortNodeValues } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Specificity from '../Specificity';
import createSingleValueIterator from '../util/createSingleValueIterator';
import {
	DONE_TOKEN,
	IAsyncIterator,
	IterationHint,
	IterationResult,
	notReady,
	ready,
} from '../util/iterators';

function isSameNodeValue(a: Value, b: Value) {
	if (a === null || b === null) {
		return false;
	}
	if (!isSubtypeOf(a.type, 'node()') || !isSubtypeOf(b.type, 'node()')) {
		return false;
	}

	return a.value === b.value;
}

function concatSortedSequences(sequences: IAsyncIterator<ISequence>): ISequence {
	let currentSequence = sequences.next(IterationHint.NONE);
	if (currentSequence.done) {
		return sequenceFactory.empty();
	}
	let currentIterator: IAsyncIterator<Value> = null;
	let previousValue: Value = null;
	return sequenceFactory.create({
		next(hint: IterationHint) {
			if (!currentSequence.ready) {
				return notReady(
					currentSequence.promise.then(() => {
						currentSequence = sequences.next(IterationHint.NONE);
					})
				);
			}
			if (currentSequence.done) {
				return currentSequence;
			}
			if (!currentIterator) {
				currentIterator = currentSequence.value.value;
			}

			let value: IterationResult<Value>;
			// Scan to the next value
			do {
				value = currentIterator.next(hint);
				if (!value.ready) {
					return value;
				}
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

interface IMappedIterator extends IAsyncIterator<Value> {
	current: IterationResult<Value>;
}

function mergeSortedSequences(
	domFacade: IWrappingDomFacade,
	sequences: IAsyncIterator<ISequence>
): ISequence {
	const allIterators: IMappedIterator[] = [];
	// Because the sequences are sorted locally, but unsorted globally, we first need to sort all the iterators.
	// For that, we need to know all of them
	let allSequencesLoaded = false;
	let allSequencesLoadedPromise = null;
	(function loadSequences() {
		let val = sequences.next(IterationHint.NONE);
		while (!val.done) {
			if (!val.ready) {
				allSequencesLoadedPromise = val.promise.then(loadSequences);
				return allSequencesLoadedPromise;
			}
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
		allSequencesLoaded = true;
		return undefined;
	})();
	let previousNode = null;

	let allSequencesAreSorted = false;
	return sequenceFactory.create({
		[Symbol.iterator]() {
			return this;
		},
		next: (hint: IterationHint) => {
			if (!allSequencesLoaded) {
				return notReady(allSequencesLoadedPromise);
			}

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
		},
	});
}

function sortResults(domFacade: IWrappingDomFacade, result: Value[]) {
	let resultContainsNodes = false;
	let resultContainsNonNodes = false;
	result.forEach((resultValue) => {
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
	private _requireSortedResults: boolean;
	private _stepExpressions: Expression[];

	constructor(stepExpressions: Expression[], requireSortedResults: boolean) {
		const pathResultsInPeerSequence = stepExpressions.every((selector) => selector.peer);
		const pathResultsInSubtreeSequence = stepExpressions.every((selector) => selector.subtree);
		super(
			stepExpressions.reduce((specificity, selector) => {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			stepExpressions,
			{
				canBeStaticallyEvaluated: false,
				peer: pathResultsInPeerSequence,
				resultOrder: requireSortedResults
					? RESULT_ORDERINGS.SORTED
					: RESULT_ORDERINGS.UNSORTED,
				subtree: pathResultsInSubtreeSequence,
			}
		);

		this._stepExpressions = stepExpressions;
		this._requireSortedResults = requireSortedResults;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		let sequenceHasPeerProperty = true;
		const result = this._stepExpressions.reduce<ISequence>(
			(intermediateResultNodesSequence, selector) => {
				let childContextIterator: IAsyncIterator<DynamicContext>;
				if (intermediateResultNodesSequence === null) {
					// first call, we should use the current dynamic context
					childContextIterator = createSingleValueIterator(dynamicContext);
				} else {
					childContextIterator = dynamicContext.createSequenceIterator(
						intermediateResultNodesSequence
					);
				}
				let resultValuesInOrderOfEvaluation: IAsyncIterator<ISequence> = {
					next: (hint: IterationHint) => {
						const childContext = childContextIterator.next(hint);
						if (!childContext.ready) {
							return notReady(childContext.promise);
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
							selector.evaluateMaybeStatically(
								childContext.value,
								executionParameters
							)
						);
					},
				};
				// Assume nicely sorted
				let sortedResultSequence: ISequence;
				if (!this._requireSortedResults) {
					sortedResultSequence = concatSortedSequences(resultValuesInOrderOfEvaluation);
				} else {
					switch (selector.expectedResultOrder) {
						case RESULT_ORDERINGS.REVERSE_SORTED: {
							const resultValuesInReverseOrder = resultValuesInOrderOfEvaluation;
							resultValuesInOrderOfEvaluation = {
								next: (hint: IterationHint) => {
									const res = resultValuesInReverseOrder.next(hint);
									if (!res.ready) {
										return res;
									}
									if (res.done) {
										return res;
									}
									return ready(
										res.value.mapAll((items) =>
											sequenceFactory.create(items.reverse())
										)
									);
								},
							};
							// Fallthrough for merges
						}
						case RESULT_ORDERINGS.SORTED:
							if (selector.subtree && sequenceHasPeerProperty) {
								sortedResultSequence = concatSortedSequences(
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
								resultValuesInOrderOfEvaluation
							);
							return concattedSequence.mapAll((allValues) =>
								sequenceFactory.create(
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
			},
			null
		);

		return result;
	}

	public getBucket() {
		return this._stepExpressions[0].getBucket();
	}
}

export default PathExpression;
