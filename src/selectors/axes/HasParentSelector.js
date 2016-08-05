define([
	'../Selector'
], function (
	Selector
) {
	'use strict';

	/**
	 * @param  {Selector}  parentSelector
	 */
	function HasParentSelector (parentSelector) {
		Selector.call(this, parentSelector.specificity);

		this._parentSelector = parentSelector;
	}

	HasParentSelector.prototype = Object.create(Selector.prototype);
	HasParentSelector.prototype.constructor = HasParentSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasParentSelector.prototype.matches = function (node, blueprint) {
		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			return false;
		}

		return this._parentSelector.matches(parentNode, blueprint);
	};

	HasParentSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasParentSelector &&
			this._parentSelector.equals(otherSelector._parentSelector);
	};

	HasParentSelector.prototype.walkStep = function (nodes, blueprint) {
		return nodes
			.filter(function (node) {
				return this.matches(node);
			}.bind(this))
			.map(blueprint.getParentNode.bind(blueprint));
	};

	return HasParentSelector;
});
