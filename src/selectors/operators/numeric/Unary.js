import Sequence from '../../dataTypes/Sequence';
import DoubleValue from '../../dataTypes/DoubleValue';
import Selector from '../../Selector';

/**
 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
 * @constructor
 * @extends Selector
 *
 * @param  {string}    kind       Either + or -
 * @param  {Selector}  valueExpr  The selector evaluating to the value to process
 */
function Unary (kind, valueExpr) {
    Selector.call(this, valueExpr.specificity, Selector.RESULT_ORDER_SORTED);
    this._valueExpr = valueExpr;

    this._kind = kind;
}

Unary.prototype = Object.create(Selector.prototype);
Unary.prototype.constructor = Unary;

Unary.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof Unary &&
        this._kind === otherSelector._kind &&
        this._valueExpr.equals(otherSelector._valueExpr);
};

Unary.prototype.evaluate = function (dynamicContext) {
    var valueSequence = this._valueExpr.evaluate(dynamicContext);
    if (valueSequence.isEmpty()) {
        return Sequence.singleton(new DoubleValue(Number.NaN));
    }

    var value = valueSequence.value[0].atomize();
    if (value.instanceOfType('xs:integer') ||
        value.instanceOfType('xs:decimal') ||
        value.instanceOfType('xs:double') ||
        value.instanceOfType('xs:float')) {

        if (this._kind === '-') {
            // TODO: clone
            value.value = -value.value;
        }
        return Sequence.singleton(value);
    }

    return Sequence.singleton(new DoubleValue(Number.NaN));
};

export default Unary;
