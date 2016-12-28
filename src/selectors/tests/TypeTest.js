import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';
import Specificity from '../Specificity';

/**
 * @constructor
 * @extends Selector
 * @param  {string}  type
 */
function TypeTest (type) {
    Selector.call(this, new Specificity({}), Selector.RESULT_ORDER_SORTED);

    this._type = type;
}

TypeTest.prototype = Object.create(Selector.prototype);
TypeTest.prototype.constructor = TypeTest;

TypeTest.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof TypeTest &&
        this._type === otherSelector._type;
};

TypeTest.prototype.evaluate = function (dynamicContext) {
    var booleanValue = dynamicContext.contextItem.value[0].instanceOfType(this._type) ? BooleanValue.TRUE : BooleanValue.FALSE;
    return Sequence.singleton(booleanValue);
};

export default TypeTest;
