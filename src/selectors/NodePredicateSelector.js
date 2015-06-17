define([
	'./Selector',
	'./SimpleSelector',
	'./SimpleSelectorSequenceSelector',
	'./Specificity'
], function (
	Selector,
	SimpleSelector,
	SimpleSelectorSequenceSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {Function}  isMatchingNode  called with node and blueprint
	 */
	function NodePredicateSelector (isMatchingNode) {
		SimpleSelector.call(this, new Specificity({external: 1}));

		this._isMatchingNode = isMatchingNode;
	}

	NodePredicateSelector.prototype = Object.create(SimpleSelector.prototype);
	NodePredicateSelector.prototype.constructor = NodePredicateSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodePredicateSelector.prototype.matches = function (node, blueprint) {
		return this._isMatchingNode.call(undefined, node, blueprint);
	};

	/**
	 * @param  {Function}  isMatchingNode
	 */
	Selector.prototype.requireNodePredicate = function (isMatchingNode) {
		return new SimpleSelectorSequenceSelector(this, new NodePredicateSelector(isMatchingNode));
	};

	return NodePredicateSelector;
});

