define([
	'fontoxml-blueprints',

	'../Selector'
], function (
	blueprints,

	Selector
) {
	'use strict';

	/**
	 * @param  {Selector}  selectorToInvert
	 */
	function InvertedSelector (selectorToInvert) {
		Selector.call(this, selectorToInvert.specificity);

		this._selectorToInvert = selectorToInvert;
	}

	InvertedSelector.prototype = Object.create(Selector.prototype);
	InvertedSelector.prototype.constructor = InvertedSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	InvertedSelector.prototype.matches = function (node, blueprint) {
		return !this._selectorToInvert.matches(node, blueprint);
	};

	InvertedSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof InvertedSelector &&
			this._selectorToInvert.equals(otherSelector._selectorToInvert);
	};

	InvertedSelector.prototype.getBucket = function () {
		// Always use the bucket for the targeted node
		return this._selectorToInvert.getBucket();
	};

	return InvertedSelector;
});
