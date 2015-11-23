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

	/**
	 * @param  {Selector}  shouldNotMatchSelector
	 * @param  {Selector}  selector
	 */
	function IsNotCombinatorSelector (shouldNotMatchSelector, selector) {
		Selector.call(this, selector.specificity.add(shouldNotMatchSelector.specificity));

		this._shouldNotMatchSelector = shouldNotMatchSelector;
		this._selector = selector;
	}

	IsNotCombinatorSelector.prototype = Object.create(Selector.prototype);
	IsNotCombinatorSelector.prototype.constructor = IsNotCombinatorSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	IsNotCombinatorSelector.prototype.matches = function (node, blueprint) {
		return !this._shouldNotMatchSelector.matches(node, blueprint) &&
			this._selector.matches(node, blueprint);
	};

	IsNotCombinatorSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof IsNotCombinatorSelector &&
			this._shouldNotMatchSelector.equals(otherSelector._shouldNotMatchSelector) &&
			this._selector.equals(otherSelector._selector);
	};

	IsNotCombinatorSelector.prototype.getBucket = function () {
		// Always use the bucket for the targeted node
		return this._selector.getBucket();
	};

	/**
	 * @param  {Selector|NodeSpec}  shouldNotMatchSelector
	 */
	Selector.prototype.requireNot = function (shouldNotMatchSelector) {
		return new IsNotCombinatorSelector(adaptNodeSpecToSelector(shouldNotMatchSelector), this);
	};

	return IsNotCombinatorSelector;
});
