import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';


/**
 * @constructor
 * @extends {Selector}
 * @param  {Selector}  ancestorSelector
 * @param  {Object=}    options
 */
function AncestorAxis (ancestorSelector, options) {
    options = options || {};
    Selector.call(this, ancestorSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

    this._ancestorSelector = ancestorSelector;
    this._isInclusive = !!options.inclusive;
}

AncestorAxis.prototype = Object.create(Selector.prototype);
AncestorAxis.prototype.constructor = AncestorAxis;

AncestorAxis.prototype.equals = function (otherSelector) {
    if (this === otherSelector) {
        return true;
    }

    return otherSelector instanceof AncestorAxis &&
        this._isInclusive === otherSelector._isInclusive &&
        this._ancestorSelector.equals(otherSelector._ancestorSelector);
};

AncestorAxis.prototype.evaluate = function (dynamicContext) {
    var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

    // Assume singleton, since axes are only valid in paths
    var contextNode = contextItem.value[0].value;
    var ancestors = [];
    for (var ancestorNode = this._isInclusive ? contextNode : domFacade.getParentNode(contextNode); ancestorNode; ancestorNode = domFacade.getParentNode(ancestorNode)) {
        var isMatchingAncestor = this._ancestorSelector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, ancestorNode)),
				contextSequence: null
			})).getEffectiveBooleanValue();

        if (isMatchingAncestor) {
            ancestors.push(ancestorNode);
        }
    }
    return new Sequence(ancestors.map(function (node) {
        return new NodeValue(dynamicContext.domFacade, node);
    }));
};

export default AncestorAxis;
