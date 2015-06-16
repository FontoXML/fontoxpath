define([
	'fontoxml-dom-utils/createNodeFilter',

	'./Selector',
	'./SimpleSelector',
	'./SimpleSelectorSequenceSelector',
	'./Specificity'
], function (
	createNodeFilter,

	Selector,
	SimpleSelector,
	SimpleSelectorSequenceSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {NodeSpec}  spec
	 */
	function NodeSpecSelector (spec) {
		SimpleSelector.call(this, new Specificity({external: 1}));

		this._isMatchingNode = createNodeFilter(spec);
	}

	NodeSpecSelector.prototype = Object.create(SimpleSelector.prototype);
	NodeSpecSelector.prototype.constructor = NodeSpecSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeSpecSelector.prototype.matches = function (node, blueprint) {
		return this._isMatchingNode.call(undefined, node, blueprint);
	};

	/**
	 * @param  {NodeSpec}  spec
	 */
	Selector.prototype.requireNodeSpec = function (spec) {
		return new SimpleSelectorSequenceSelector(this, new NodeSpecSelector(spec));
	};

	return NodeSpecSelector;
});

