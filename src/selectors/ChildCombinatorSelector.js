define([
	'../adaptNodeSpecToSelector',
	'./Selector'
], function (
	adaptNodeSpecToSelector,
	Selector
) {
	'use strict';

	/**
	 * @param  {Selector}  parentSelector
	 * @param  {Selector}  childSelector
	 */
	function ChildCombinatorSelector (parentSelector, childSelector) {
		this._parentSelector = parentSelector;
		this._childSelector = childSelector;
	}

	ChildCombinatorSelector.prototype = Object.create(Selector.prototype);
	ChildCombinatorSelector.prototype.constructor = ChildCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	ChildCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._childSelector.matches(node, blueprint)) {
			return false;
		}

		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			return false;
		}

		return this._parentSelector.matches(parentNode, blueprint);
	};

	/**
	 * @param  {Selector|NodeSpec}  parentSelector
	 */
	Selector.prototype.requireParent = function (parentSelector) {
		return new ChildCombinatorSelector(adaptNodeSpecToSelector(parentSelector), this);
	};

	return ChildCombinatorSelector;
});
