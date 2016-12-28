import isSameSetOfSelectors from '../isSameSetOfSelectors';
import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';

/**
 * The Sequence selector evaluates its operands and returns them as a single sequence
 * @constructor
 * @extends Selector
 *
 * @param  {Array<Selector>}  selectors
 */
function SequenceOperator (selectors) {
    Selector.call(
        this,
        selectors.reduce(function (specificity, selector) {
            return specificity.add(selector.specificity);
        }, new Specificity({})),
        Selector.RESULT_ORDER_UNSORTED);
    this._selectors = selectors;
}

SequenceOperator.prototype = Object.create(Selector.prototype);
SequenceOperator.prototype.constructor = SequenceOperator;

SequenceOperator.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof SequenceOperator &&
        isSameSetOfSelectors(this._selectors, otherSelector._selectors);
};

SequenceOperator.prototype.evaluate = function (dynamicContext) {
    return this._selectors.reduce(function (accum, selector) {
        return accum.merge(selector.evaluate(dynamicContext));
    }, new Sequence());
};

export default SequenceOperator;
