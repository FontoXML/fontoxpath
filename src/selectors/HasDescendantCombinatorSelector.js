define([
	'fontoxml-blueprints',

	'../adaptNodeSpecToSelector',
	'./Selector'
], function (
	blueprints,

	adaptNodeSpecToSelector,
	Selector
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  childSelector
	 * @param  {Selector}  parentSelector
	 */
	function HasDescendantCombinatorSelector (descendantSelector, parentSelector) {
		Selector.call(this, descendantSelector.specificity.add(parentSelector.specificity));

		this._descendantSelector = descendantSelector;
		this._parentSelector = parentSelector;
	}

	HasDescendantCombinatorSelector.prototype = Object.create(Selector.prototype);
	HasDescendantCombinatorSelector.prototype.constructor = HasDescendantCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasDescendantCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._parentSelector.matches(node, blueprint)) {
			return false;
		}

		return blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
			return this._descendantSelector.matches(descendantNode, blueprint);
		}.bind(this)).length > 0;
	};

	/**
	 * @param  {Selector|NodeSpec}  descendantSelector
	 */
	Selector.prototype.requireDescendant = function (descendantSelector) {
		return new HasDescendantCombinatorSelector(adaptNodeSpecToSelector(descendantSelector), this);
	};

	return HasDescendantCombinatorSelector;
});
