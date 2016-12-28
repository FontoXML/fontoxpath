import Selector from './Selector';
import adaptNodeSpecToSelector from '../adaptNodeSpecToSelector';
import AttributeAxis from './axes/AttributeAxis';
import AncestorAxis from './axes/AncestorAxis';
import ChildAxis from './axes/ChildAxis';
import DescendantAxis from './axes/DescendantAxis';
import FollowingSiblingAxis from './axes/FollowingSiblingAxis';
import ParentAxis from './axes/ParentAxis';
import PrecedingSiblingAxis from './axes/PrecedingSiblingAxis';
import Literal from './literals/Literal';
import SequenceOperator from './operators/SequenceOperator';
import AndOperator from './operators/boolean/AndOperator';
import NotOperator from './operators/boolean/NotOperator';
import OrOperator from './operators/boolean/OrOperator';
import Compare from './operators/compares/Compare';
import NodeNameSelector from './tests/NodeNameSelector';
import NodePredicateSelector from './tests/NodePredicateSelector';

import DomFacade from '../DomFacade';

/**
 * @param  {Selector|NodeSpec}  ancestorSelector
 * @return {Selector}
 */
Selector.prototype.requireAncestor = function (ancestorSelector) {
    return new AndOperator([
        this,
        new AncestorAxis(adaptNodeSpecToSelector(ancestorSelector))
    ]);
};

/**
 * @param  {string}           attributeName
 * @param  {string|Array<string>}  [attributeValues]  if omitted, the selector matches if the attribute is present
 * @return {Selector}
 */
Selector.prototype.requireAttribute = function (attributeName, attributeValues) {
    if (attributeValues !== undefined) {
        if (!Array.isArray(attributeValues)) {
            attributeValues = [attributeValues];
        }

        var attributeValuesAsLiterals = attributeValues.map(function (attributeValue) {
            return new Literal(attributeValue, 'xs:string');
        });

        return new AndOperator([
            this,
            new Compare(
                ['generalCompare', '='],
                new AttributeAxis(new NodeNameSelector(attributeName)),
                new SequenceOperator(attributeValuesAsLiterals)
            )
        ]);
    }

    return new AndOperator([
        this,
        new AttributeAxis(new NodeNameSelector(attributeName))
    ]);
};

/**
 * @typedef {(string|Array<string>|function(Node):boolean)}
 */
var NodeSpec;

/**
 * @param  {Selector|NodeSpec}  childSelector
 * @return {Selector}
 */
Selector.prototype.requireChild = function (childSelector) {
    return new AndOperator([
        this,
        new ChildAxis(adaptNodeSpecToSelector(childSelector))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  descendantSelector
 * @return {Selector}
 */
Selector.prototype.requireDescendant = function (descendantSelector) {
    return new AndOperator([
        this,
        new DescendantAxis(adaptNodeSpecToSelector(descendantSelector))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  parentSelector
 * @return {Selector}
 */
Selector.prototype.requireParent = function (parentSelector) {
    return new AndOperator([
        this,
        new ParentAxis(adaptNodeSpecToSelector(parentSelector))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  selectorToInvert
 * @return {Selector}
 */
Selector.prototype.requireNot = function (selectorToInvert) {
    return new AndOperator([
        this,
        new NotOperator(adaptNodeSpecToSelector(selectorToInvert))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  siblingSelector
 * @return {Selector}
 */
Selector.prototype.requireFollowingSibling = function (siblingSelector) {
    return new AndOperator([
        this,
        new FollowingSiblingAxis(adaptNodeSpecToSelector(siblingSelector))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  siblingSelector
 * @return {Selector}
 */
Selector.prototype.requirePrecedingSibling = function (siblingSelector) {
    return new AndOperator([
        this,
        new PrecedingSiblingAxis(adaptNodeSpecToSelector(siblingSelector))
    ]);
};

/**
 * @param  {Selector|NodeSpec}  selectorToRequire
 * @return {Selector}
 */
Selector.prototype.orRequire = function (selectorToRequire) {
    return new OrOperator([
        this,
        adaptNodeSpecToSelector(selectorToRequire)]);
};

/**
 * @param  {!function(Node,DomFacade):boolean}  isMatchingNode
 * @return {Selector}
 */
Selector.prototype.requireNodePredicate = function (isMatchingNode) {
    return new AndOperator([this, new NodePredicateSelector(isMatchingNode)]);
};
