import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';

/**
 * @constructor
 * @extends {Selector}
 *
 * @param  {Selector}    selector
 * @param  {Selector}    filterSelector
 */
function Filter (selector, filterSelector) {
    Selector.call(this, selector.specificity.add(filterSelector.specificity), selector.expectedResultOrder);

    this._selector = selector;
    this._filterSelector = filterSelector;
}

Filter.prototype = Object.create(Selector.prototype);
Filter.prototype.constructor = Filter;

Filter.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof Filter &&
        this._selector.equals(otherSelector._selector) &&
        this._filterSelector.equals(otherSelector._filterSelector);
};

Filter.prototype.getBucket = function () {
    return this._selector.getBucket();
};

Filter.prototype.evaluate = function (dynamicContext) {
    var valuesToFilter = this._selector.evaluate(dynamicContext);

    var filteredValues = valuesToFilter.value.filter(function (value, index) {
        var result = this._filterSelector.evaluate(
            dynamicContext.createScopedContext({
                contextItem: Sequence.singleton(value),
                contextSequence: valuesToFilter
            }));

        if (result.isEmpty()) {
            return false;
        }

        var resultValue = result.value[0];
        if (resultValue.instanceOfType('xs:numeric')) {
            // Remember: XPath is one-based
            return resultValue.value === index + 1;
        }

        return result.getEffectiveBooleanValue();
    }.bind(this));

    return new Sequence(filteredValues);
};

export default Filter;
