define([
	'./SimpleSelector',
	'./Specificity'
], function (
	SimpleSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {Number}  nodeType
	 */
	function NodeTypeSelector (nodeType) {
		SimpleSelector.call(this, new Specificity({nodeType: 1}));

		this._nodeType = nodeType;
	}

	NodeTypeSelector.prototype = Object.create(SimpleSelector.prototype);
	NodeTypeSelector.prototype.constructor = NodeTypeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeTypeSelector.prototype.matches = function (node, blueprint) {
		return node.nodeType === this._nodeType;
	};

	return NodeTypeSelector;
});

