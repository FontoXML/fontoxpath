define([
	'fontoxml-blueprints',

	'./Selector'
], function (
	blueprints,

	Selector
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  siblingSelector
	 */
	function HasPrecedingSiblingSelector (siblingSelector) {
		Selector.call(this, siblingSelector.specificity);

		this._siblingSelector = siblingSelector;
	}

	HasPrecedingSiblingSelector.prototype = Object.create(Selector.prototype);
	HasPrecedingSiblingSelector.prototype.constructor = HasPrecedingSiblingSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasPrecedingSiblingSelector.prototype.matches = function (node, blueprint) {
		return !!blueprintQuery.findPreviousSibling(blueprint, node, function (childNode) {
			return this._siblingSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	/**
	 * @param  {Selector}  otherSelector
	 */
	HasPrecedingSiblingSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasPrecedingSiblingSelector &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	};

	return HasPrecedingSiblingSelector;
});
