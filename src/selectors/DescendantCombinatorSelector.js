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
	function DescendantCombinatorSelector (ancestorSelector, descendantSelector) {
		Selector.call(this, ancestorSelector.specificity.add(descendantSelector.specificity));

		this._ancestorSelector = ancestorSelector;
		this._descendantSelector = descendantSelector;
	}

	DescendantCombinatorSelector.prototype = Object.create(Selector.prototype);
	DescendantCombinatorSelector.prototype.constructor = DescendantCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	DescendantCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._descendantSelector.matches(node, blueprint)) {
			return false;
		}

		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			return false;
		}

		return !!blueprintQuery.findClosestAncestor(
			blueprint,
			parentNode,
			this._ancestorSelector.matches.bind(this._ancestorSelector));
	};

	/**
	 * @param  {Selector|NodeSpec}  ancestorSelector
	 */
	Selector.prototype.requireAncestor = function (ancestorSelector) {
		return new DescendantCombinatorSelector(adaptNodeSpecToSelector(ancestorSelector), this);
	};

	return DescendantCombinatorSelector;
});

