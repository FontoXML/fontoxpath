define([
	'./Selector',
	'./Specificity'
], function (
	Selector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {Number}  nodeType
	 */
	function NodeTypeSelector (nodeType) {
		Selector.call(this, new Specificity({nodeType: 1}));

		this._nodeType = nodeType;
	}

	NodeTypeSelector.prototype = Object.create(Selector.prototype);
	NodeTypeSelector.prototype.constructor = NodeTypeSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeTypeSelector.prototype.matches = function (node, blueprint) {
		return node.nodeType === this._nodeType;
	};

	NodeTypeSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof NodeTypeSelector &&
			this._nodeType === otherSelector._nodeType;
	};


	return NodeTypeSelector;
});
