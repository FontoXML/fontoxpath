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
	 * @param  {Selector}  childSelector
	 */
	function HasChildSelector (childSelector) {
		Selector.call(this, childSelector.specificity);

		this._childSelector = childSelector;
	}

	HasChildSelector.prototype = Object.create(Selector.prototype);
	HasChildSelector.prototype.constructor = HasChildSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasChildSelector.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findChild(blueprint, node, function (childNode) {
			return this._childSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	HasChildSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasChildSelector &&
			this._childSelector.equals(otherSelector._childSelector);
	};

	HasChildSelector.prototype.walkStep = function (nodes, blueprint) {
		return nodes.reduce(function (resultingNodes, node) {
 			Array.prototype.push.apply(
				resultingNodes,
				blueprintQuery.findChildren(blueprint, node, function (childNode) {
						return this._childSelector.matches(childNode, blueprint);
					}.bind(this)));
			return resultingNodes;
		}.bind(this), []);
	};

	return HasChildSelector;
});
