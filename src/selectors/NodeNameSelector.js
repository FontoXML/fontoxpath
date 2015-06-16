define([
	'fontoxml-dom-utils/domInfo',

	'./SimpleSelector',
	'./Specificity'
], function (
	domInfo,

	SimpleSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {String|String[]}  nodeName
	 */
	function NodeNameSelector (nodeName) {
		SimpleSelector.call(this, new Specificity({nodeName: 1}));

		this._nodeNames = Array.isArray(nodeName) ? nodeName : [nodeName];
	}

	NodeNameSelector.prototype = Object.create(SimpleSelector.prototype);
	NodeNameSelector.prototype.constructor = NodeNameSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodeNameSelector.prototype.matches = function (node, blueprint) {
		return domInfo.isElement(node, this._nodeNames);
	};

	return NodeNameSelector;
});

