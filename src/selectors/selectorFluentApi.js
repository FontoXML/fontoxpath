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
	'./literals/Literal',
	'./operators/SequenceOperator',
	'./operators/boolean/AndOperator',
	'./operators/boolean/NotOperator',
	'./operators/boolean/OrOperator',
	'./operators/compares/Compare',
	'./tests/NodeNameSelector',
	'./tests/NodePredicateSelector'
], function (
	Selector,
	adaptNodeSpecToSelector,

	AttributeAxis,
	AncestorAxis,
	ChildAxis,
	DescendantAxis,
	FollowingSiblingAxis,
	ParentAxis,
	PrecedingSiblingAxis,
	Literal,
	SequenceOperator,
	AndOperator,
	NotOperator,
	OrOperator,
	Compare,
	NodeNameSelector,
	NodePredicateSelector
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
			new AttributeAxis(new NodeNameSelector(attributeName))]);
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
