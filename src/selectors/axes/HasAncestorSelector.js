define([
	'fontoxml-blueprints',

	'../Selector'
], function (
	blueprints,

	Selector
	) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  ancestorSelector
	 */
	function HasAncestorSelector (ancestorSelector) {
		Selector.call(this, ancestorSelector.specificity);

		this._ancestorSelector = ancestorSelector;
	}

	HasAncestorSelector.prototype = Object.create(Selector.prototype);
	HasAncestorSelector.prototype.constructor = HasAncestorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasAncestorSelector.prototype.matches = function (node, blueprint) {
		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			// Out of document, fail
			return false;
		}

		return !!blueprintQuery.findClosestAncestor(blueprint, parentNode, function (ancestorNode) {
			return this._ancestorSelector.matches(ancestorNode, blueprint);
		}.bind(this));
	};

	HasAncestorSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasAncestorSelector &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector);
	};

	HasAncestorSelector.prototype.walkStep = function (nodes, blueprint) {
		return nodes.reduce(function (resultingNodes, node) {
			Array.prototype.push.apply(
				resultingNodes,
				blueprintQuery.findAllAncestors(blueprint, node, false)
					.filter(function (node) {
						return this._ancestorSelector.matches(node, blueprint);
					}.bind(this)));

			return resultingNodes;
		}.bind(this), []);
	};

	return HasAncestorSelector;
});
