define([
	'./Selector',
	'../adaptNodeSpecToSelector',

	'./axes/AttributeAxis',
	'./axes/AncestorAxis',
	'./axes/ChildAxis',
	'./axes/DescendantAxis',
	'./axes/FollowingSiblingAxis',
	'./axes/ParentAxis',
	'./axes/PrecedingSiblingAxis',
	'./operators/boolean/AndOperator',
	'./operators/boolean/NotOperator',
	'./operators/boolean/OrOperator',
	'./tests/NodeNameSelector',
	'./tests/NodePredicateSelector'
], function (
	Selector,
	adaptNodeSpecToSelector,
	AttributeSelector,

	AncestorAxis,
	ChildAxis,
	DescendantAxis,
	FollowingSiblingAxis,
	ParentAxis,
	PrecedingSiblingAxis,
	AndOperator,
	NotOperator,
	NodeNameSelector,
	NodePredicateSelector,
	OrOperator
) {
	'use strict';


	/**
	 * @param  {Selector|NodeSpec}  ancestorSelector
	 */
	Selector.prototype.requireAncestor = function (ancestorSelector) {
		return new AndOperator([
			this,
			new AncestorAxis(adaptNodeSpecToSelector(ancestorSelector))]);
	};

	/**
	 * @param  {String}           attributeName
	 * @param  {String|String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present
	 */
	Selector.prototype.requireAttribute = function (attributeName, attributeValues) {
		if (attributeValues !== undefined && !Array.isArray(attributeValues)) {
			attributeValues = [attributeValues];
		}

		return new AndOperator([this, new AttributeSelector(attributeName, attributeValues)]);
	};
	/**
	 * @param  {Selector|NodeSpec}  childSelector
	 */
	Selector.prototype.requireChild = function (childSelector) {
		return new AndOperator([
			this,
			new ChildAxis(adaptNodeSpecToSelector(childSelector))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  descendantSelector
	 */
	Selector.prototype.requireDescendant = function (descendantSelector) {
		return new AndOperator([
			this,
			new DescendantAxis(adaptNodeSpecToSelector(descendantSelector))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  parentSelector
	 */
	Selector.prototype.requireParent = function (parentSelector) {
		return new AndOperator([
			this,
			new ParentAxis(adaptNodeSpecToSelector(parentSelector))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  selectorToInvert
	 */
	Selector.prototype.requireNot = function (selectorToInvert) {
		return new AndOperator([
			this,
			new NotOperator(adaptNodeSpecToSelector(selectorToInvert))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  siblingSelector
	 */
	Selector.prototype.requireFollowingSibling = function (siblingSelector) {
		return new AndOperator([
			this,
			new FollowingSiblingAxis(adaptNodeSpecToSelector(siblingSelector))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  siblingSelector
	 */
	Selector.prototype.requirePrecedingSibling = function (siblingSelector) {
		return new AndOperator([
			this,
			new PrecedingSiblingAxis(adaptNodeSpecToSelector(siblingSelector))]);
	};

	/**
	 * @param  {Selector|NodeSpec}  selectorToRequire
	 */
	Selector.prototype.orRequire = function (selectorToRequire) {
		return new OrOperator(
			this,
			new OrOperator(adaptNodeSpecToSelector, selectorToRequire));
	};

	/**
	 * @param  {Function}  isMatchingNode
	 */
	Selector.prototype.requireNodePredicate = function (isMatchingNode) {
		return new AndOperator([this, new NodePredicateSelector(isMatchingNode)]);
	};
});
