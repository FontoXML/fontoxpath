"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_1 = require("../Expression");
const Specificity_1 = require("../Specificity");
const SequenceFactory_1 = require("../dataTypes/SequenceFactory");
const createSingleValueIterator_1 = require("../util/createSingleValueIterator");
const isSubtypeOf_1 = require("../dataTypes/isSubtypeOf");
const documentOrderUtils_1 = require("../dataTypes/documentOrderUtils");
const iterators_1 = require("../util/iterators");
function isSameNodeValue(a, b) {
    if (a === null || b === null) {
        return false;
    }
    if (!isSubtypeOf_1.default(a.type, 'node()') || !isSubtypeOf_1.default(b.type, 'node()')) {
        return false;
    }
    return a.value === b.value;
}
function concatSortedSequences(_, sequences) {
    let currentSequence = sequences.next();
    if (currentSequence.done) {
        return SequenceFactory_1.default.empty();
    }
    let currentIterator = null;
    let previousValue = null;
    return SequenceFactory_1.default.create({
        next: function () {
            if (!currentSequence.ready) {
                return iterators_1.notReady(currentSequence.promise.then(() => {
                    currentSequence = sequences.next();
                }));
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
function mergeSortedSequences(domFacade, sequences) {
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
    return SequenceFactory_1.default.create({
        [Symbol.iterator]: function () {
            return this;
        },
        next: () => {
            if (!allSequencesLoaded) {
                return iterators_1.notReady(allSequencesLoadedPromise);
            }
            if (!allSequencesAreSorted) {
                allSequencesAreSorted = true;
                if (allIterators.every((iterator => isSubtypeOf_1.default(iterator.current.value.type, 'node()')))) {
                    // Sort the iterators initially. We know these iterators return locally sorted items, but we do not know the inter-ordering of these items.
                    allIterators.sort((iteratorA, iteratorB) => documentOrderUtils_1.compareNodePositions(domFacade, iteratorA.current.value, iteratorB.current.value));
                }
            }
            let consumedValue;
            do {
                if (!allIterators.length) {
                    return iterators_1.DONE_TOKEN;
                }
                const consumedIterator = allIterators.shift();
                consumedValue = consumedIterator.current;
                consumedIterator.current = consumedIterator.next();
                if (!isSubtypeOf_1.default(consumedValue.value.type, 'node()')) {
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
                        const comparisonResult = documentOrderUtils_1.compareNodePositions(domFacade, consumedIterator.current.value, otherNode);
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
    let resultContainsNodes = false, resultContainsNonNodes = false;
    result.forEach(function (resultValue) {
        if (isSubtypeOf_1.default(resultValue.type, 'node()')) {
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
        return documentOrderUtils_1.sortNodeValues(domFacade, result);
    }
    return result;
}
class PathExpression extends Expression_1.default {
    constructor(stepExpressions, requireSortedResults) {
        const pathResultsInPeerSequence = stepExpressions.every(selector => selector.peer);
        const pathResultsInSubtreeSequence = stepExpressions.every(selector => selector.subtree);
        super(stepExpressions.reduce(function (specificity, selector) {
            // Implicit AND, so sum
            return specificity.add(selector.specificity);
        }, new Specificity_1.default({})), stepExpressions, {
            resultOrder: requireSortedResults ?
                Expression_1.default.RESULT_ORDERINGS.SORTED :
                Expression_1.default.RESULT_ORDERINGS.UNSORTED,
            peer: pathResultsInPeerSequence,
            subtree: pathResultsInSubtreeSequence,
            canBeStaticallyEvaluated: false
        });
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
                childContextIterator = createSingleValueIterator_1.default(dynamicContext);
            }
            else {
                childContextIterator = dynamicContext.createSequenceIterator(intermediateResultNodesSequence);
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
                    if (childContext.value.contextItem !== null && !isSubtypeOf_1.default(childContext.value.contextItem.type, 'node()')) {
                        throw new Error('XPTY0019: The / operator can only be applied to xml/json nodes.');
                    }
                    return iterators_1.ready(selector.evaluateMaybeStatically(childContext.value, executionParameters));
                }
            };
            // Assume nicely sorted
            let sortedResultSequence;
            if (!this._requireSortedResults) {
                sortedResultSequence = concatSortedSequences(executionParameters.domFacade, resultValuesInOrderOfEvaluation);
            }
            else {
                switch (selector.expectedResultOrder) {
                    case Expression_1.default.RESULT_ORDERINGS.REVERSE_SORTED: {
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
                                return iterators_1.ready(result.value.mapAll(items => SequenceFactory_1.default.create(items.reverse())));
                            }
                        };
                        // Fallthrough for merges
                    }
                    case Expression_1.default.RESULT_ORDERINGS.SORTED:
                        if (selector.subtree && sequenceHasPeerProperty) {
                            sortedResultSequence = concatSortedSequences(executionParameters.domFacade, resultValuesInOrderOfEvaluation);
                            break;
                        }
                        // Only locally sorted
                        sortedResultSequence = mergeSortedSequences(executionParameters.domFacade, resultValuesInOrderOfEvaluation);
                        break;
                    case Expression_1.default.RESULT_ORDERINGS.UNSORTED: {
                        // The result should be sorted before we can continue
                        const concattedSequence = concatSortedSequences(executionParameters.domFacade, resultValuesInOrderOfEvaluation);
                        return concattedSequence.mapAll(allValues => SequenceFactory_1.default.create(sortResults(executionParameters.domFacade, allValues)));
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
exports.default = PathExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQYXRoRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF1QztBQUN2QyxnREFBeUM7QUFDekMsa0VBQTJEO0FBQzNELGlGQUEwRTtBQUMxRSwwREFBbUQ7QUFDbkQsd0VBQXVGO0FBRXZGLGlEQUFnRTtBQUloRSxTQUFTLGVBQWUsQ0FBRSxDQUFDLEVBQUUsQ0FBQztJQUM3QixJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNiO0lBQ0QsSUFBSSxDQUFDLHFCQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtRQUNyRSxPQUFPLEtBQUssQ0FBQztLQUNiO0lBRUQsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDNUIsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLFNBQW1DO0lBQ3BFLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7UUFDekIsT0FBTyx5QkFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQy9CO0lBQ0QsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQzNCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQztJQUN6QixPQUFPLHlCQUFlLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksRUFBRTtZQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFO2dCQUMzQixPQUFPLG9CQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNqRCxlQUFlLEdBQUcsU0FB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b0JBQW9CLEdBQUcscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLCtCQUErQixDQUFDLENBQUM7NEJBQzdHLE1BQU07eUJBQ047d0JBQ0Qsc0JBQXNCO3dCQUN0QixvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsK0JBQStCLENBQUMsQ0FBQzt3QkFDNUcsTUFBTTtvQkFDUCxLQUFLLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzFDLHFEQUFxRDt3QkFDckQsTUFBTSxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsK0JBQStCLENBQUMsQ0FBQzt3QkFDaEgsT0FBTyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyx5QkFBZSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDNUg7aUJBQ0Q7YUFDRDtZQUNELHlHQUF5RztZQUN6Ryw2Q0FBNkM7WUFDN0MsdUJBQXVCLEdBQUcsdUJBQXVCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQztZQUNuRSxPQUFPLG9CQUFvQixDQUFDO1FBQzdCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVULE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNEO0FBRUQsa0JBQWUsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb24gZnJvbSAnLi4vRXhwcmVzc2lvbic7XG5pbXBvcnQgU3BlY2lmaWNpdHkgZnJvbSAnLi4vU3BlY2lmaWNpdHknO1xuaW1wb3J0IFNlcXVlbmNlRmFjdG9yeSBmcm9tICcuLi9kYXRhVHlwZXMvU2VxdWVuY2VGYWN0b3J5JztcbmltcG9ydCBjcmVhdGVTaW5nbGVWYWx1ZUl0ZXJhdG9yIGZyb20gJy4uL3V0aWwvY3JlYXRlU2luZ2xlVmFsdWVJdGVyYXRvcic7XG5pbXBvcnQgaXNTdWJ0eXBlT2YgZnJvbSAnLi4vZGF0YVR5cGVzL2lzU3VidHlwZU9mJztcbmltcG9ydCB7IHNvcnROb2RlVmFsdWVzLCBjb21wYXJlTm9kZVBvc2l0aW9ucyB9IGZyb20gJy4uL2RhdGFUeXBlcy9kb2N1bWVudE9yZGVyVXRpbHMnO1xuaW1wb3J0IHsgQXN5bmNJdGVyYXRvciB9IGZyb20gJy4uL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCB7IHJlYWR5LCBub3RSZWFkeSwgRE9ORV9UT0tFTiB9IGZyb20gJy4uL3V0aWwvaXRlcmF0b3JzJztcbmltcG9ydCBJU2VxdWVuY2UgZnJvbSAnLi4vZGF0YVR5cGVzL0lTZXF1ZW5jZSc7XG5pbXBvcnQgRG9tRmFjYWRlIGZyb20gJ3NyYy9kb21GYWNhZGUvRG9tRmFjYWRlJztcblxuZnVuY3Rpb24gaXNTYW1lTm9kZVZhbHVlIChhLCBiKSB7XG5cdGlmIChhID09PSBudWxsIHx8IGIgPT09IG51bGwpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKCFpc1N1YnR5cGVPZihhLnR5cGUsICdub2RlKCknKSB8fCAhaXNTdWJ0eXBlT2YoYi50eXBlLCAnbm9kZSgpJykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4gYS52YWx1ZSA9PT0gYi52YWx1ZTtcbn1cblxuZnVuY3Rpb24gY29uY2F0U29ydGVkU2VxdWVuY2VzKF8sIHNlcXVlbmNlczogQXN5bmNJdGVyYXRvcjxJU2VxdWVuY2U+KTogSVNlcXVlbmNlIHtcblx0bGV0IGN1cnJlbnRTZXF1ZW5jZSA9IHNlcXVlbmNlcy5uZXh0KCk7XG5cdGlmIChjdXJyZW50U2VxdWVuY2UuZG9uZSkge1xuXHRcdHJldHVybiBTZXF1ZW5jZUZhY3RvcnkuZW1wdHkoKTtcblx0fVxuXHRsZXQgY3VycmVudEl0ZXJhdG9yID0gbnVsbDtcblx0bGV0IHByZXZpb3VzVmFsdWUgPSBudWxsO1xuXHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZSh7XG5cdFx0bmV4dDogZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCFjdXJyZW50U2VxdWVuY2UucmVhZHkpIHtcblx0XHRcdFx0cmV0dXJuIG5vdFJlYWR5KGN1cnJlbnRTZXF1ZW5jZS5wcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGN1cnJlbnRTZXF1ZW5jZSA9IHNlcXVlbmNlcy5uZXh0KCk7XG5cdFx0XHRcdH0pKTtcblx0XHRcdH1cblx0XHRcdGlmIChjdXJyZW50U2VxdWVuY2UuZG9uZSkge1xuXHRcdFx0XHRyZXR1cm4gY3VycmVudFNlcXVlbmNlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFjdXJyZW50SXRlcmF0b3IpIHtcblx0XHRcdFx0Y3VycmVudEl0ZXJhdG9yID0gY3VycmVudFNlcXVlbmNlLnZhbHVlLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdmFsdWU7XG5cdFx0XHQvLyBTY2FuIHRvIHRoZSBuZXh0IHZhbHVlXG5cdFx0XHRkbyB7XG5cdFx0XHRcdHZhbHVlID0gY3VycmVudEl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdFx0aWYgKCF2YWx1ZS5yZWFkeSkge1xuXHRcdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodmFsdWUuZG9uZSkge1xuXHRcdFx0XHRcdGN1cnJlbnRTZXF1ZW5jZSA9IHNlcXVlbmNlcy5uZXh0KCk7XG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRTZXF1ZW5jZS5kb25lKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN1cnJlbnRJdGVyYXRvciA9IGN1cnJlbnRTZXF1ZW5jZS52YWx1ZS52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSB3aGlsZSAodmFsdWUuZG9uZSB8fCBpc1NhbWVOb2RlVmFsdWUodmFsdWUudmFsdWUsIHByZXZpb3VzVmFsdWUpKTtcblx0XHRcdHByZXZpb3VzVmFsdWUgPSB2YWx1ZS52YWx1ZTtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBtZXJnZVNvcnRlZFNlcXVlbmNlcyhkb21GYWNhZGU6IERvbUZhY2FkZSwgc2VxdWVuY2VzOiBBc3luY0l0ZXJhdG9yPElTZXF1ZW5jZT4pOiBJU2VxdWVuY2Uge1xuXHRjb25zdCBhbGxJdGVyYXRvcnMgPSBbXTtcblx0Ly8gQmVjYXVzZSB0aGUgc2VxdWVuY2VzIGFyZSBzb3J0ZWQgbG9jYWxseSwgYnV0IHVuc29ydGVkIGdsb2JhbGx5LCB3ZSBmaXJzdCBuZWVkIHRvIHNvcnQgYWxsIHRoZSBpdGVyYXRvcnMuXG5cdC8vIEZvciB0aGF0LCB3ZSBuZWVkIHRvIGtub3cgYWxsIG9mIHRoZW1cblx0bGV0IGFsbFNlcXVlbmNlc0xvYWRlZCA9IGZhbHNlO1xuXHRsZXQgYWxsU2VxdWVuY2VzTG9hZGVkUHJvbWlzZSA9IG51bGw7XG5cdChmdW5jdGlvbiBsb2FkU2VxdWVuY2VzICgpIHtcblx0XHRsZXQgdmFsID0gc2VxdWVuY2VzLm5leHQoKTtcblx0XHR3aGlsZSAoIXZhbC5kb25lKSB7XG5cdFx0XHRpZiAoIXZhbC5yZWFkeSkge1xuXHRcdFx0XHRhbGxTZXF1ZW5jZXNMb2FkZWRQcm9taXNlID0gdmFsLnByb21pc2UudGhlbihsb2FkU2VxdWVuY2VzKTtcblx0XHRcdFx0cmV0dXJuIGFsbFNlcXVlbmNlc0xvYWRlZFByb21pc2U7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpdGVyYXRvciA9IHZhbC52YWx1ZS52YWx1ZTtcblx0XHRcdGNvbnN0IG1hcHBlZEl0ZXJhdG9yID0ge1xuXHRcdFx0XHRjdXJyZW50OiBpdGVyYXRvci5uZXh0KCksXG5cdFx0XHRcdG5leHQ6ICgpID0+IGl0ZXJhdG9yLm5leHQoKVxuXHRcdFx0fTtcblx0XHRcdGlmICghbWFwcGVkSXRlcmF0b3IuY3VycmVudC5kb25lKSB7XG5cdFx0XHRcdGFsbEl0ZXJhdG9ycy5wdXNoKG1hcHBlZEl0ZXJhdG9yKTtcblx0XHRcdH1cblx0XHRcdHZhbCA9IHNlcXVlbmNlcy5uZXh0KCk7XG5cdFx0fVxuXHRcdGFsbFNlcXVlbmNlc0xvYWRlZCA9IHRydWU7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSkoKTtcblx0bGV0IHByZXZpb3VzTm9kZSA9IG51bGw7XG5cblx0bGV0IGFsbFNlcXVlbmNlc0FyZVNvcnRlZCA9IGZhbHNlO1xuXHRyZXR1cm4gU2VxdWVuY2VGYWN0b3J5LmNyZWF0ZSh7XG5cdFx0W1N5bWJvbC5pdGVyYXRvcl06IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0aWYgKCFhbGxTZXF1ZW5jZXNMb2FkZWQpIHtcblx0XHRcdFx0cmV0dXJuIG5vdFJlYWR5KGFsbFNlcXVlbmNlc0xvYWRlZFByb21pc2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWFsbFNlcXVlbmNlc0FyZVNvcnRlZCkge1xuXHRcdFx0XHRhbGxTZXF1ZW5jZXNBcmVTb3J0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdGlmIChhbGxJdGVyYXRvcnMuZXZlcnkoKGl0ZXJhdG9yID0+IGlzU3VidHlwZU9mKGl0ZXJhdG9yLmN1cnJlbnQudmFsdWUudHlwZSwgJ25vZGUoKScpKSkpIHtcblx0XHRcdFx0XHQvLyBTb3J0IHRoZSBpdGVyYXRvcnMgaW5pdGlhbGx5LiBXZSBrbm93IHRoZXNlIGl0ZXJhdG9ycyByZXR1cm4gbG9jYWxseSBzb3J0ZWQgaXRlbXMsIGJ1dCB3ZSBkbyBub3Qga25vdyB0aGUgaW50ZXItb3JkZXJpbmcgb2YgdGhlc2UgaXRlbXMuXG5cdFx0XHRcdFx0YWxsSXRlcmF0b3JzLnNvcnQoKGl0ZXJhdG9yQSwgaXRlcmF0b3JCKSA9PiBjb21wYXJlTm9kZVBvc2l0aW9ucyhcblx0XHRcdFx0XHRcdGRvbUZhY2FkZSxcblx0XHRcdFx0XHRcdGl0ZXJhdG9yQS5jdXJyZW50LnZhbHVlLFxuXHRcdFx0XHRcdFx0aXRlcmF0b3JCLmN1cnJlbnQudmFsdWUpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgY29uc3VtZWRWYWx1ZTtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKCFhbGxJdGVyYXRvcnMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERPTkVfVE9LRU47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBjb25zdW1lZEl0ZXJhdG9yID0gYWxsSXRlcmF0b3JzLnNoaWZ0KCk7XG5cdFx0XHRcdGNvbnN1bWVkVmFsdWUgPSBjb25zdW1lZEl0ZXJhdG9yLmN1cnJlbnQ7XG5cdFx0XHRcdGNvbnN1bWVkSXRlcmF0b3IuY3VycmVudCA9IGNvbnN1bWVkSXRlcmF0b3IubmV4dCgpO1xuXHRcdFx0XHRpZiAoIWlzU3VidHlwZU9mKGNvbnN1bWVkVmFsdWUudmFsdWUudHlwZSwgJ25vZGUoKScpKSB7XG5cdFx0XHRcdFx0Ly8gU29ydGluZyBkb2VzIG5vdCBtYXR0ZXJcblx0XHRcdFx0XHRyZXR1cm4gY29uc3VtZWRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWNvbnN1bWVkSXRlcmF0b3IuY3VycmVudC5yZWFkeSkge1xuXHRcdFx0XHRcdHJldHVybiBjb25zdW1lZEl0ZXJhdG9yLmN1cnJlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFjb25zdW1lZEl0ZXJhdG9yLmN1cnJlbnQuZG9uZSkge1xuXHRcdFx0XHRcdC8vIE1ha2UgdGhlIGl0ZXJhdG9ycyBzb3J0ZWQgYWdhaW5cblx0XHRcdFx0XHRsZXQgbG93ID0gMDtcblx0XHRcdFx0XHRsZXQgaGlnaCA9IGFsbEl0ZXJhdG9ycy5sZW5ndGggLSAxO1xuXHRcdFx0XHRcdGxldCBtaWQgPSAwO1xuXHRcdFx0XHRcdHdoaWxlIChsb3cgPD0gaGlnaCkge1xuXHRcdFx0XHRcdFx0bWlkID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcblx0XHRcdFx0XHRcdGNvbnN0IG90aGVyTm9kZSA9IGFsbEl0ZXJhdG9yc1ttaWRdLmN1cnJlbnQudmFsdWU7XG5cdFx0XHRcdFx0XHRjb25zdCBjb21wYXJpc29uUmVzdWx0ID0gY29tcGFyZU5vZGVQb3NpdGlvbnMoXG5cdFx0XHRcdFx0XHRcdGRvbUZhY2FkZSxcblx0XHRcdFx0XHRcdFx0Y29uc3VtZWRJdGVyYXRvci5jdXJyZW50LnZhbHVlLFxuXHRcdFx0XHRcdFx0XHRvdGhlck5vZGUpO1xuXHRcdFx0XHRcdFx0aWYgKGNvbXBhcmlzb25SZXN1bHQgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gVGhlIHNhbWUsIHRoaXMgc2hvdWxkIGJlIDBcblx0XHRcdFx0XHRcdFx0bG93ID0gbWlkO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChjb21wYXJpc29uUmVzdWx0ID4gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBBZnRlcjpcblx0XHRcdFx0XHRcdFx0bG93ID0gbWlkICsgMTtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRoaWdoID0gbWlkIC0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YWxsSXRlcmF0b3JzLnNwbGljZShsb3csIDAsIGNvbnN1bWVkSXRlcmF0b3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IHdoaWxlIChpc1NhbWVOb2RlVmFsdWUoY29uc3VtZWRWYWx1ZS52YWx1ZSwgcHJldmlvdXNOb2RlKSk7XG5cdFx0XHRwcmV2aW91c05vZGUgPSBjb25zdW1lZFZhbHVlLnZhbHVlO1xuXHRcdFx0cmV0dXJuIGNvbnN1bWVkVmFsdWU7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc29ydFJlc3VsdHMgKGRvbUZhY2FkZSwgcmVzdWx0KSB7XG5cdGxldCByZXN1bHRDb250YWluc05vZGVzID0gZmFsc2UsXG5cdHJlc3VsdENvbnRhaW5zTm9uTm9kZXMgPSBmYWxzZTtcblx0cmVzdWx0LmZvckVhY2goZnVuY3Rpb24gKHJlc3VsdFZhbHVlKSB7XG5cdFx0aWYgKGlzU3VidHlwZU9mKHJlc3VsdFZhbHVlLnR5cGUsICdub2RlKCknKSkge1xuXHRcdFx0cmVzdWx0Q29udGFpbnNOb2RlcyA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVzdWx0Q29udGFpbnNOb25Ob2RlcyA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdENvbnRhaW5zTm9uTm9kZXMgJiYgcmVzdWx0Q29udGFpbnNOb2Rlcykge1xuXHRcdHRocm93IG5ldyBFcnJvcignWFBUWTAwMTg6IFRoZSBwYXRoIG9wZXJhdG9yIHNob3VsZCBlaXRoZXIgcmV0dXJuIG5vZGVzIG9yIG5vbi1ub2Rlcy4gTWl4ZWQgc2VxdWVuY2VzIGFyZSBub3QgYWxsb3dlZC4nKTtcblx0fVxuXG5cdGlmIChyZXN1bHRDb250YWluc05vZGVzKSB7XG5cdFx0cmV0dXJuIHNvcnROb2RlVmFsdWVzKGRvbUZhY2FkZSwgcmVzdWx0KTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5jbGFzcyBQYXRoRXhwcmVzc2lvbiBleHRlbmRzIEV4cHJlc3Npb24ge1xuXHRfc3RlcEV4cHJlc3Npb25zOiBFeHByZXNzaW9uW107XG5cdF9yZXF1aXJlU29ydGVkUmVzdWx0czogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihzdGVwRXhwcmVzc2lvbnM6IEFycmF5PEV4cHJlc3Npb24+LCByZXF1aXJlU29ydGVkUmVzdWx0cykge1xuXHRcdGNvbnN0IHBhdGhSZXN1bHRzSW5QZWVyU2VxdWVuY2UgPSBzdGVwRXhwcmVzc2lvbnMuZXZlcnkoc2VsZWN0b3IgPT4gc2VsZWN0b3IucGVlcik7XG5cdFx0Y29uc3QgcGF0aFJlc3VsdHNJblN1YnRyZWVTZXF1ZW5jZSA9IHN0ZXBFeHByZXNzaW9ucy5ldmVyeShzZWxlY3RvciA9PiBzZWxlY3Rvci5zdWJ0cmVlKTtcblx0XHRzdXBlcihcblx0XHRcdHN0ZXBFeHByZXNzaW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHNwZWNpZmljaXR5LCBzZWxlY3Rvcikge1xuXHRcdFx0XHQvLyBJbXBsaWNpdCBBTkQsIHNvIHN1bVxuXHRcdFx0XHRyZXR1cm4gc3BlY2lmaWNpdHkuYWRkKHNlbGVjdG9yLnNwZWNpZmljaXR5KTtcblx0XHRcdH0sIG5ldyBTcGVjaWZpY2l0eSh7fSkpLFxuXHRcdFx0c3RlcEV4cHJlc3Npb25zLFxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHRPcmRlcjogcmVxdWlyZVNvcnRlZFJlc3VsdHMgP1xuXHRcdFx0XHRcdEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5TT1JURUQgOlxuXHRcdFx0XHRcdEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5VTlNPUlRFRCxcblx0XHRcdFx0cGVlcjogcGF0aFJlc3VsdHNJblBlZXJTZXF1ZW5jZSxcblx0XHRcdFx0c3VidHJlZTogcGF0aFJlc3VsdHNJblN1YnRyZWVTZXF1ZW5jZSxcblx0XHRcdFx0Y2FuQmVTdGF0aWNhbGx5RXZhbHVhdGVkOiBmYWxzZVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLl9zdGVwRXhwcmVzc2lvbnMgPSBzdGVwRXhwcmVzc2lvbnM7XG5cdFx0dGhpcy5fcmVxdWlyZVNvcnRlZFJlc3VsdHMgPSByZXF1aXJlU29ydGVkUmVzdWx0cztcblxuXHR9XG5cblx0Z2V0QnVja2V0ICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RlcEV4cHJlc3Npb25zWzBdLmdldEJ1Y2tldCgpO1xuXHR9XG5cblx0ZXZhbHVhdGUgKGR5bmFtaWNDb250ZXh0LCBleGVjdXRpb25QYXJhbWV0ZXJzKSB7XG5cdFx0bGV0IHNlcXVlbmNlSGFzUGVlclByb3BlcnR5ID0gdHJ1ZTtcblx0XHRjb25zdCByZXN1bHQgPSB0aGlzLl9zdGVwRXhwcmVzc2lvbnMucmVkdWNlKChpbnRlcm1lZGlhdGVSZXN1bHROb2Rlc1NlcXVlbmNlLCBzZWxlY3RvcikgPT4ge1xuXHRcdFx0bGV0IGNoaWxkQ29udGV4dEl0ZXJhdG9yO1xuXHRcdFx0aWYgKGludGVybWVkaWF0ZVJlc3VsdE5vZGVzU2VxdWVuY2UgPT09IG51bGwpIHtcblx0XHRcdFx0Ly8gZmlyc3QgY2FsbCwgd2Ugc2hvdWxkIHVzZSB0aGUgY3VycmVudCBkeW5hbWljIGNvbnRleHRcblx0XHRcdFx0Y2hpbGRDb250ZXh0SXRlcmF0b3IgPSBjcmVhdGVTaW5nbGVWYWx1ZUl0ZXJhdG9yKGR5bmFtaWNDb250ZXh0KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjaGlsZENvbnRleHRJdGVyYXRvciA9IGR5bmFtaWNDb250ZXh0LmNyZWF0ZVNlcXVlbmNlSXRlcmF0b3IoaW50ZXJtZWRpYXRlUmVzdWx0Tm9kZXNTZXF1ZW5jZSk7XG5cdFx0XHR9XG5cdFx0XHRsZXQgcmVzdWx0VmFsdWVzSW5PcmRlck9mRXZhbHVhdGlvbiA9IHtcblx0XHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkQ29udGV4dCA9IGNoaWxkQ29udGV4dEl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdFx0XHRpZiAoIWNoaWxkQ29udGV4dC5yZWFkeSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNoaWxkQ29udGV4dDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoY2hpbGRDb250ZXh0LmRvbmUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBjaGlsZENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChjaGlsZENvbnRleHQudmFsdWUuY29udGV4dEl0ZW0gIT09IG51bGwgJiYgIWlzU3VidHlwZU9mKGNoaWxkQ29udGV4dC52YWx1ZS5jb250ZXh0SXRlbS50eXBlLCAnbm9kZSgpJykpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignWFBUWTAwMTk6IFRoZSAvIG9wZXJhdG9yIGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8geG1sL2pzb24gbm9kZXMuJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiByZWFkeShzZWxlY3Rvci5ldmFsdWF0ZU1heWJlU3RhdGljYWxseShjaGlsZENvbnRleHQudmFsdWUsIGV4ZWN1dGlvblBhcmFtZXRlcnMpKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdC8vIEFzc3VtZSBuaWNlbHkgc29ydGVkXG5cdFx0XHRsZXQgc29ydGVkUmVzdWx0U2VxdWVuY2U7XG5cdFx0XHRpZiAoIXRoaXMuX3JlcXVpcmVTb3J0ZWRSZXN1bHRzKSB7XG5cdFx0XHRcdHNvcnRlZFJlc3VsdFNlcXVlbmNlID0gY29uY2F0U29ydGVkU2VxdWVuY2VzKGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLCByZXN1bHRWYWx1ZXNJbk9yZGVyT2ZFdmFsdWF0aW9uKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2ggKHNlbGVjdG9yLmV4cGVjdGVkUmVzdWx0T3JkZXIpIHtcblx0XHRcdFx0XHRjYXNlIEV4cHJlc3Npb24uUkVTVUxUX09SREVSSU5HUy5SRVZFUlNFX1NPUlRFRDoge1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0VmFsdWVzSW5SZXZlcnNlT3JkZXIgPSByZXN1bHRWYWx1ZXNJbk9yZGVyT2ZFdmFsdWF0aW9uO1xuXHRcdFx0XHRcdFx0cmVzdWx0VmFsdWVzSW5PcmRlck9mRXZhbHVhdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0bmV4dDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IHJlc3VsdFZhbHVlc0luUmV2ZXJzZU9yZGVyLm5leHQoKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIXJlc3VsdC5yZWFkeSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVhZHkocmVzdWx0LnZhbHVlLm1hcEFsbChpdGVtcyA9PiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKGl0ZW1zLnJldmVyc2UoKSkpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdC8vIEZhbGx0aHJvdWdoIGZvciBtZXJnZXNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBFeHByZXNzaW9uLlJFU1VMVF9PUkRFUklOR1MuU09SVEVEOlxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdG9yLnN1YnRyZWUgJiYgc2VxdWVuY2VIYXNQZWVyUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0c29ydGVkUmVzdWx0U2VxdWVuY2UgPSBjb25jYXRTb3J0ZWRTZXF1ZW5jZXMoZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGUsIHJlc3VsdFZhbHVlc0luT3JkZXJPZkV2YWx1YXRpb24pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIE9ubHkgbG9jYWxseSBzb3J0ZWRcblx0XHRcdFx0XHRcdHNvcnRlZFJlc3VsdFNlcXVlbmNlID0gbWVyZ2VTb3J0ZWRTZXF1ZW5jZXMoZXhlY3V0aW9uUGFyYW1ldGVycy5kb21GYWNhZGUsIHJlc3VsdFZhbHVlc0luT3JkZXJPZkV2YWx1YXRpb24pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBFeHByZXNzaW9uLlJFU1VMVF9PUkRFUklOR1MuVU5TT1JURUQ6IHtcblx0XHRcdFx0XHRcdC8vIFRoZSByZXN1bHQgc2hvdWxkIGJlIHNvcnRlZCBiZWZvcmUgd2UgY2FuIGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRjb25zdCBjb25jYXR0ZWRTZXF1ZW5jZSA9IGNvbmNhdFNvcnRlZFNlcXVlbmNlcyhleGVjdXRpb25QYXJhbWV0ZXJzLmRvbUZhY2FkZSwgcmVzdWx0VmFsdWVzSW5PcmRlck9mRXZhbHVhdGlvbik7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29uY2F0dGVkU2VxdWVuY2UubWFwQWxsKGFsbFZhbHVlcyA9PiBTZXF1ZW5jZUZhY3RvcnkuY3JlYXRlKHNvcnRSZXN1bHRzKGV4ZWN1dGlvblBhcmFtZXRlcnMuZG9tRmFjYWRlLCBhbGxWYWx1ZXMpKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiB0aGlzIHNlbGVjdG9yIHJldHVybmVkIG5vbi1wZWVycywgdGhlIHNlcXVlbmNlIGNvdWxkIGJlIGNvbnRhbWluYXRlZCB3aXRoIGFuY2VzdG9yL2Rlc2NlbmRhbnQgbm9kZXNcblx0XHRcdC8vIFRoaXMgbWFrZXMgc29ydGluZyB1c2luZyBjb25jYXQgaW1wb3NzaWJsZVxuXHRcdFx0c2VxdWVuY2VIYXNQZWVyUHJvcGVydHkgPSBzZXF1ZW5jZUhhc1BlZXJQcm9wZXJ0eSAmJiBzZWxlY3Rvci5wZWVyO1xuXHRcdFx0cmV0dXJuIHNvcnRlZFJlc3VsdFNlcXVlbmNlO1xuXHRcdH0sIG51bGwpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXRoRXhwcmVzc2lvbjtcbiJdfQ==