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
	 * @param  {Selector}  descendantSelector
	 */
	function HasDescendantSelector (descendantSelector) {
		Selector.call(this, descendantSelector.specificity);

		this._descendantSelector = descendantSelector;
	}

	HasDescendantSelector.prototype = Object.create(Selector.prototype);
	HasDescendantSelector.prototype.constructor = HasDescendantSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasDescendantSelector.prototype.matches = function (node, blueprint) {
		return blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
			return this._descendantSelector.matches(descendantNode, blueprint);
		}.bind(this)).length > 0;
	};

	HasDescendantSelector.prototype.equals = function (otherSelector) {
		return otherSelector instanceof HasDescendantSelector &&
			this._descendantSelector.equals(otherSelector._descendantSelector);
	};


	return HasDescendantSelector;
});
