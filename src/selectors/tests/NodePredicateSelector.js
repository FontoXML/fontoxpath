import Sequence from '../dataTypes/Sequence';
import BooleanValue from '../dataTypes/BooleanValue';
import Selector from '../Selector';
import Specificity from '../Specificity';

import DomFacade from '../../DomFacade';

/**
 * @constructor
 * @extends Selector
 * @param  {function(Node, DomFacade): boolean}  isMatchingNode  called with node and blueprint
 */
function NodePredicateSelector (isMatchingNode) {
    Selector.call(this, new Specificity({
        [Specificity.EXTERNAL_KIND]: 1
    }), Selector.RESULT_ORDER_SORTED);

    this._isMatchingNode = isMatchingNode;
}

NodePredicateSelector.prototype = Object.create(Selector.prototype);
NodePredicateSelector.prototype.constructor = NodePredicateSelector;

NodePredicateSelector.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof NodePredicateSelector &&
        // Not perfect, but function logically compare cannot be done
        this._isMatchingNode === otherSelector._isMatchingNode;
};

NodePredicateSelector.prototype.evaluate = function (dynamicContext) {
    var sequence = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;
    // TODO: non-singleton nodeTests
    var booleanValue = this._isMatchingNode.call(undefined, sequence.value[0].value, domFacade) ?
        BooleanValue.TRUE :
        BooleanValue.FALSE;
    return Sequence.singleton(booleanValue);
};

export default NodePredicateSelector;
