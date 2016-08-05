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
	 * @param  {Selector}  siblingSelector
	 */
	function HasFollowingSiblingSelector (siblingSelector) {
		Selector.call(this, siblingSelector.specificity);

		this._siblingSelector = siblingSelector;
	}

	HasFollowingSiblingSelector.prototype = Object.create(Selector.prototype);
	HasFollowingSiblingSelector.prototype.constructor = HasFollowingSiblingSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasFollowingSiblingSelector.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findNextSibling(blueprint, node, function (childNode) {
			return this._siblingSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	/**
	 * @param  {Selector}  otherSelector
	 */
	HasFollowingSiblingSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasFollowingSiblingSelector &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	};

	HasFollowingSiblingSelector.prototype.walkStep = function (nodes, blueprint) {
		function isMatchingSibling (selector, node) {
				return selector.matches(node, blueprint);
		}
		return nodes.reduce(function (resultingNodes, node) {
			var sibling = node;
			while ((sibling = blueprintQuery.findNextSibling(
				sibling,
				isMatchingSibling.bind(undefined, this._siblingSelector)))) {

				resultingNodes.push(sibling);
			}
			return resultingNodes;
		}, []);
	};


	return HasFollowingSiblingSelector;
});
