define([
	'../Selector'
], function (
	Selector
) {
	'use strict';

	/**
	 * @param  {Selector}  childSelector
	 */
	function SelfSelector (selector) {
		Selector.call(this, selector.specificity);

		this._selector = selector;
	}

	SelfSelector.prototype = Object.create(Selector.prototype);
	SelfSelector.prototype.constructor = SelfSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	SelfSelector.prototype.matches = function (node, blueprint) {
		return this._selector.matches(node, blueprint);
	};

	SelfSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof SelfSelector &&
			this._selector.equals(otherSelector._selector);
	};

	SelfSelector.prototype.walkStep = function (nodes, blueprint) {
		return nodes.filter(function (node) {
			return this._selector.matches(node, blueprint);
		}.bind(this));
	};

	return SelfSelector;
});
