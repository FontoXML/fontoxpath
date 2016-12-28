import Selector from '../../Selector';
import Sequence from '../../dataTypes/Sequence';
import BooleanValue from '../../dataTypes/BooleanValue';


/**
 * @constructor
 * @extends Selector
 * @deprecated
 * @param  {Selector}  selectorToInvert
 */
function NotOperator (selectorToInvert) {
    Selector.call(this, selectorToInvert.specificity, Selector.RESULT_ORDER_SORTED);

    this._selectorToInvert = selectorToInvert;
}

NotOperator.prototype = Object.create(Selector.prototype);
NotOperator.prototype.constructor = NotOperator;

NotOperator.prototype.evaluate = function (dynamicContext) {
    var result = this._selectorToInvert.evaluate(dynamicContext);
    return Sequence.singleton((!result.getEffectiveBooleanValue()) ? BooleanValue.TRUE : BooleanValue.FALSE);
};

NotOperator.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof NotOperator &&
        this._selectorToInvert.equals(otherSelector._selectorToInvert);
};

NotOperator.prototype.getBucket = function () {
    // Always use the bucket for the targeted node
    return this._selectorToInvert.getBucket();
};

export default NotOperator;
