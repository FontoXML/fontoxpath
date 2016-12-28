import isSameSetOfSelectors from '../isSameSetOfSelectors';
import Specificity from '../Specificity';
import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import sortNodeValues from '../dataTypes/sortNodeValues';

/**
 * The 'union' combining selector, or when matching, concats otherwise.
 * order is undefined.
 * @constructor
 * @extends Selector
 * @param  {Array<Selector>}  selectors
 */
function Union (selectors) {
    Selector.call(
        this,
        selectors.reduce(function (maxSpecificity, selector) {
            if (maxSpecificity.compareTo(selector.specificity) > 0) {
                return maxSpecificity;
            }
            return selector.specificity;
        }, new Specificity({})),
        Selector.RESULT_ORDER_UNSORTED);

    this._subSelectors = selectors;
}

Union.prototype = Object.create(Selector.prototype);
Union.prototype.constructor = Union;

Union.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof Union &&
        isSameSetOfSelectors(this._subSelectors, otherSelector._subSelectors);
};

Union.prototype.evaluate = function (dynamicContext) {
    var nodeSet = this._subSelectors.reduce(function (resultingNodeSet, selector) {
        var results = selector.evaluate(dynamicContext);
        var allItemsAreNode = results.value.every(function (valueItem) {
            return valueItem.instanceOfType('node()');
        });

        if (!allItemsAreNode) {
            throw new Error('ERRXPTY0004: The sequences to union are not of type node()*');
        }
        results.value.forEach(function (nodeValue) {
            resultingNodeSet.add(nodeValue);
        });
        return resultingNodeSet;
    }, new Set());

    var sortedValues = sortNodeValues(dynamicContext.domFacade, Array.from(nodeSet.values()));
    return new Sequence(sortedValues);
};
export default Union;
