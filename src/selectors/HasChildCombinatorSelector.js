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
	function HasChildCombinatorSelector (childSelector, parentSelector) {
		Selector.call(this, childSelector.specificity.add(parentSelector.specificity));

		this._childSelector = childSelector;
		this._parentSelector = parentSelector;
	}

	HasChildCombinatorSelector.prototype = Object.create(Selector.prototype);
	HasChildCombinatorSelector.prototype.constructor = HasChildCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	HasChildCombinatorSelector.prototype.matches = function (node, blueprint) {
		if (!this._parentSelector.matches(node, blueprint)) {
			return false;
		}

		return !!blueprintQuery.findChild(blueprint, node, function (childNode) {
			return this._childSelector.matches(childNode, blueprint);
		}.bind(this));
	};

	/**
	 * @param  {Selector|NodeSpec}  childSelector
	 */
	Selector.prototype.requireChild = function (childSelector) {
		return new HasChildCombinatorSelector(adaptNodeSpecToSelector(childSelector), this);
	};

	return HasChildCombinatorSelector;
});
