import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @constructor
 * @extends {Selector}
 * @param  {Selector}  siblingSelector
 */
function PrecedingSiblingAxis (siblingSelector) {
    Selector.call(this, siblingSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

    this._siblingSelector = siblingSelector;
}

PrecedingSiblingAxis.prototype = Object.create(Selector.prototype);
PrecedingSiblingAxis.prototype.constructor = PrecedingSiblingAxis;

/**
 * @param  {Selector}  otherSelector
 */
PrecedingSiblingAxis.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof PrecedingSiblingAxis &&
        this._siblingSelector.equals(otherSelector._siblingSelector);
};

PrecedingSiblingAxis.prototype.evaluate = function (dynamicContext) {
    var contextItem = dynamicContext.contextItem;

    function isMatchingPrecedingSibling (selector, node) {
        return selector.evaluate(dynamicContext.createScopedContext({
            contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
            contextSequence: null
        })).getEffectiveBooleanValue();
    }

    var sibling = contextItem.value[0].value;
    var nodes = [];
    while ((sibling = dynamicContext.domFacade.getPreviousSibling(sibling))) {
        if (!isMatchingPrecedingSibling(this._siblingSelector, sibling)) {
            continue;
        }
        nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
    }
    return new Sequence(nodes);
};

export default PrecedingSiblingAxis;
