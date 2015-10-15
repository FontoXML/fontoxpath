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
	 * @param  {Selector}  descendantSelector
	 * @param  {Selector}  ancestorSelector
	 */
	function HasDescendantCombinatorSelector (descendantSelector, ancestorSelector) {
		Selector.call(this, descendantSelector.specificity.add(ancestorSelector.specificity));

		this._descendantSelector = descendantSelector;
		this._ancestorSelector = ancestorSelector;
	}

	HasDescendantCombinatorSelector.prototype = Object.create(Selector.prototype);
	HasDescendantCombinatorSelector.prototype.constructor = HasDescendantCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasDescendantCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._ancestorSelector.matches(node, blueprint)) {
			return false;
		}

		return blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
			return this._descendantSelector.matches(descendantNode, blueprint);
		}.bind(this)).length > 0;
	};

	HasDescendantCombinatorSelector.prototype.equals = function (otherSelector) {
		return otherSelector instanceof HasDescendantCombinatorSelector &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector) &&
			this._descendantSelector.equals(otherSelector._descendantSelector);
	};

	HasDescendantCombinatorSelector.prototype.getBucket = function () {
		// Always use the bucket for the targeted node
		return this._ancestorSelector.getBucket();
	};

	/**
	 * @param  {Selector|NodeSpec}  descendantSelector
	 */
	Selector.prototype.requireDescendant = function (descendantSelector) {
		return new HasDescendantCombinatorSelector(adaptNodeSpecToSelector(descendantSelector), this);
	};

	return HasDescendantCombinatorSelector;
});
