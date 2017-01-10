import Selector from '../Selector';
import Specificity from '../Specificity';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';

/**
 * @constructor
 * @extends Selector
 */
function UniversalSelector () {
    Selector.call(
        this,
        new Specificity({
            [Specificity.UNIVERSAL_KIND]: 1
        }),
        Selector.RESULT_ORDER_SORTED);
}

UniversalSelector.prototype = Object.create(Selector.prototype);
UniversalSelector.prototype.constructor = UniversalSelector;

UniversalSelector.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof UniversalSelector;
};

UniversalSelector.prototype.evaluate = function () {
    return Sequence.singleton(BooleanValue.TRUE);
};

export default UniversalSelector;
