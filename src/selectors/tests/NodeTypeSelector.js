import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';
import Specificity from '../Specificity';

/**
 * @constructor
 * @extends Selector
 * @param  {number}  nodeType
 */
function NodeTypeSelector (nodeType) {
    Selector.call(this, new Specificity({
        nodeType: 1
    }), Selector.RESULT_ORDER_SORTED);

    this._nodeType = nodeType;
}

NodeTypeSelector.prototype = Object.create(Selector.prototype);
NodeTypeSelector.prototype.constructor = NodeTypeSelector;

NodeTypeSelector.prototype.evaluate = function (dynamicContext) {
    var sequence = dynamicContext.contextItem;
    var booleanValue = this._nodeType === sequence.value[0].value.nodeType ?
        BooleanValue.TRUE :
        BooleanValue.FALSE;
    return Sequence.singleton(booleanValue);
};

NodeTypeSelector.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof NodeTypeSelector &&
        this._nodeType === otherSelector._nodeType;
};

NodeTypeSelector.prototype.getBucket = function () {
    return 'type-' + this._nodeType;
};

export default NodeTypeSelector;
