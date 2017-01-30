import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import {
	sortNodeValues,
	compareNodePositions
} from '../dataTypes/documentOrderUtils';
import NodeValue from '../dataTypes/NodeValue';

function sortResults (domFacade, result) {
    var resultContainsNodes = false,
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
			Selector.RESULT_ORDERINGS.SORTED);

		this._stepSelectors = stepSelectors;
	}

	equals (otherSelector) {
		if (otherSelector === this) {
			return true;
		}
		if (!(otherSelector instanceof PathSelector)) {
			return false;
		}

		const otherPathSelector = /** @type {PathSelector} */ (otherSelector);

		return this._stepSelectors.length === otherPathSelector._stepSelectors.length &&
			this._stepSelectors.every(function (selector, i) {
				return otherPathSelector._stepSelectors[i].equals(selector);
			});
	}

	getBucket () {
		return this._stepSelectors[0].getBucket();
	}

	evaluate (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem;

		var result = this._stepSelectors.reduce(function (intermediateResultNodes, selector) {
				// All but the last step should return nodes. The last step may return whatever, as long as it is not mixed
				intermediateResultNodes.forEach(function (intermediateResultNode) {
					if (!(intermediateResultNode instanceof NodeValue)) {
						throw new Error('XPTY0019: The / operator can only be applied to xml/json nodes.');
					}
				});

				var resultValuesInOrderOfEvaluation = [];
				var resultSet = new Set();
				intermediateResultNodes.forEach(function (nodeValue) {
					var newResults = selector.evaluate(dynamicContext.createScopedContext({
							contextItem: Sequence.singleton(nodeValue),
							contextSequence: null
						}));

					if (newResults.isEmpty()) {
						return;
					}

					var sortedResultNodes;
					if (selector.expectedResultOrder === Selector.RESULT_ORDERINGS.REVERSE_SORTED) {
						sortedResultNodes = newResults.value.reverse();
					}
					else {
						sortedResultNodes = newResults.value;
					}

					// We can assume that, if this subresult is sorted, node[n] will be AFTER node[n-1]. We should not have to reset low to 0.
					let low = 0;
					sortedResultNodes.forEach(function (newResult) {
						if (newResult instanceof NodeValue) {
							// Because the intermediateResults are ordered, and these results are ordered too, we should be able to dedupe and concat these results
							if (resultSet.has(newResult)) {
								return;
							}
							resultSet.add(newResult);
						}

						// Because the previous set is sorted, and the transformation outputs sorted items, we can merge-sort them into the output
						if (selector.expectedResultOrder !== Selector.RESULT_ORDERINGS.UNSORTED) {
							let high = resultValuesInOrderOfEvaluation.length - 1;
							var mid = 0;
							while (low <= high) {
								mid = Math.floor((low + high) / 2);
								var otherNode = resultValuesInOrderOfEvaluation[mid];
								if (compareNodePositions(dynamicContext.domFacade, newResult, otherNode) > 0) {
									// After:
									low = mid + 1;
									continue;
								}
								high = mid - 1;
							}
							resultValuesInOrderOfEvaluation.splice(low, 0, newResult);
							return;
						}
						resultValuesInOrderOfEvaluation.push(newResult);
					});
				}, []);

				if (selector.expectedResultOrder === selector.RESULT_ORDERINGS.UNSORTED) {
					// The result should be sorted before we can continue
					resultValuesInOrderOfEvaluation = sortResults(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
				}

				return resultValuesInOrderOfEvaluation;
			}, nodeSequence.value);

		return new Sequence(result);
	}
}

export default PathSelector;
