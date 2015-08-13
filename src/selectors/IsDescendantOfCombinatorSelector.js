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
	 * @param  {Selector}  ancestorSelector
	 * @param  {Selector}  descendantSelector
	 */
	function IsDescendantOfCombinatorSelector (ancestorSelector, descendantSelector) {
		Selector.call(this, ancestorSelector.specificity.add(descendantSelector.specificity));

		this._ancestorSelector = ancestorSelector;
		this._descendantSelector = descendantSelector;
	}

	IsDescendantOfCombinatorSelector.prototype = Object.create(Selector.prototype);
	IsDescendantOfCombinatorSelector.prototype.constructor = IsDescendantOfCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	IsDescendantOfCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._descendantSelector.matches(node, blueprint)) {
			return false;
		}

		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			return false;
		}

		return !!blueprintQuery.findClosestAncestor(blueprint, parentNode, function (ancestorNode) {
			return this._ancestorSelector.matches(ancestorNode, blueprint);
		}.bind(this));
	};

	IsDescendantOfCombinatorSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof IsDescendantOfCombinatorSelector &&
			this._descendantSelector.equals(otherSelector._descendantSelector) &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector);
	};

	/**
	 * @param  {Selector|NodeSpec}  ancestorSelector
	 */
	Selector.prototype.requireAncestor = function (ancestorSelector) {
		return new IsDescendantOfCombinatorSelector(adaptNodeSpecToSelector(ancestorSelector), this);
	};

	return IsDescendantOfCombinatorSelector;
});
