import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import sortNodeValues from '../dataTypes/sortNodeValues';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @constructor
 * @extends Selector
 * @param  {Array<Selector>}  stepSelectors
 */
function PathSelector (stepSelectors) {
    Selector.call(
        this,
        stepSelectors.reduce(function (specificity, selector) {
            // Implicit AND, so sum
            return specificity.add(selector.specificity);
        }, new Specificity({})),
        Selector.RESULT_ORDER_SORTED);

    this._stepSelectors = stepSelectors;
}

PathSelector.prototype = Object.create(Selector.prototype);
PathSelector.prototype.constructor = PathSelector;

PathSelector.prototype.equals = function (otherSelector) {
    return otherSelector instanceof PathSelector &&
        this._stepSelectors.length === otherSelector._stepSelectors.length &&
        this._stepSelectors.every(function (selector, i) {
            return otherSelector._stepSelectors[i].equals(selector);
        });
};

PathSelector.prototype.getBucket = function () {
    return this._stepSelectors[0].getBucket();
};

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

PathSelector.prototype.evaluate = function (dynamicContext) {
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
            if (selector.expectedResultOrder === Selector.RESULT_ORDER_REVERSE_SORTED) {
                sortedResultNodes = newResults.value.reverse();
            }
 else {
                sortedResultNodes = newResults.value;
            }

            sortedResultNodes.forEach(function (newResult) {
                if (newResult instanceof NodeValue) {
                    // Because the intermediateResults are ordered, and these results are ordered too, we should be able to dedupe and concat these results
                    if (resultSet.has(newResult)) {
                        return;
                    }
                    resultSet.add(newResult);
                }
                resultValuesInOrderOfEvaluation.push(newResult);
            });
        }, []);

        if (selector.expectedResultOrder === selector.RESULT_ORDER_UNSORTED) {
            // The result should be sorted before we can continue
            resultValuesInOrderOfEvaluation = sortResults(dynamicContext.domFacade, resultValuesInOrderOfEvaluation);
        }

        return resultValuesInOrderOfEvaluation;
    }, nodeSequence.value);

    return new Sequence(result);
};

export default PathSelector;
