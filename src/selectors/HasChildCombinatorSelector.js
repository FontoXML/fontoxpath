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

	HasChildCombinatorSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof HasChildCombinatorSelector &&
			this._parentSelector.equals(otherSelector._parentSelector) &&
			this._childSelector.equals(otherSelector._childSelector);
	};

	HasChildCombinatorSelector.prototype.getBucket = function () {
		// Always use the bucket for the targeted node
		return this._parentSelector.getBucket();
	};

	/**
	 * @param  {Selector|NodeSpec}  childSelector
	 */
	Selector.prototype.requireChild = function (childSelector) {
		return new HasChildCombinatorSelector(adaptNodeSpecToSelector(childSelector), this);
	};

	return HasChildCombinatorSelector;
});
