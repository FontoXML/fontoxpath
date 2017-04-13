import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import {
	sortNodeValues,
	compareNodePositions
} from '../dataTypes/documentOrderUtils';
import NodeValue from '../dataTypes/NodeValue';

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
			Selector.RESULT_ORDERINGS.SORTED);

		this._stepSelectors = stepSelectors;
		this._getStringifiedValue = () => `(relative-path ${this._stepSelectors.map(selector => selector.toString()).join(' ')})`;
	}

	getBucket () {
		return this._stepSelectors[0].getBucket();
	}

	evaluate (dynamicContext) {
		return dynamicContext.cache.withCache(this.toString(), dynamicContext, () => {
			const result = this._stepSelectors.reduce(function (intermediateResultNodes, selector) {
				// All but the last step should return nodes. The last step may return whatever, as long as it is not mixed
				intermediateResultNodes.forEach(function (intermediateResultNode) {
					if (!(intermediateResultNode instanceof NodeValue)) {
						throw new Error('XPTY0019: The / operator can only be applied to xml/json nodes.');
					}
				});

				let resultValuesInOrderOfEvaluation = [];
				const resultSet = new Set();
				for (const childContext of dynamicContext.createSequenceIterator(new Sequence(intermediateResultNodes))) {
					const newResults = selector.evaluate(childContext);

					if (newResults.isEmpty()) {
						continue;
					}

					let sortedResultNodes;
					if (selector.expectedResultOrder === Selector.RESULT_ORDERINGS.REVERSE_SORTED) {
						sortedResultNodes = newResults.value.reverse();
					}
					else {
						sortedResultNodes = newResults.value;
					}

					// We can assume that, if this subresult is sorted, node[n] will be AFTER node[n-1]. We should not have to reset low to 0.
					let low = 0;
					for (const newResult of sortedResultNodes) {
						if (newResult instanceof NodeValue) {
							// Because the intermediateResults are ordered, and these results are ordered too, we should be able to dedupe and concat these results
							if (resultSet.has(newResult)) {
								continue;
							}
							resultSet.add(newResult);
						}

						// Because the previous set is sorted, and the transformation outputs sorted items, we can merge-sort them into the output
						if (selector.expectedResultOrder !== Selector.RESULT_ORDERINGS.UNSORTED) {
							let high = resultValuesInOrderOfEvaluation.length - 1;
							let mid = 0;
							while (low <= high) {
								mid = Math.floor((low + high) / 2);
								const otherNode = resultValuesInOrderOfEvaluation[mid];
								if (compareNodePositions(dynamicContext.domFacade, newResult, otherNode) > 0) {
									// After:
									low = mid + 1;
									continue;
								}
								high = mid - 1;
							}
							resultValuesInOrderOfEvaluation.splice(low, 0, newResult);
							continue;
						}
						resultValuesInOrderOfEvaluation.push(newResult);
					}
				}

				if (selector.expectedResultOrder === selector.RESULT_ORDERINGS.UNSORTED) {
					// The result should be sorted before we can continue
					resultValuesInOrderOfEvaluation = sortResults(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
				}

				return resultValuesInOrderOfEvaluation;
			}, [dynamicContext.contextItem]);

			return new Sequence(result);
		});
	}
}

export default PathSelector;
