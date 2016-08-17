define([
	'../Selector',
	'../dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}  childSelector
	 */
	function SelfAxis (selector) {
		Selector.call(this, selector.specificity);

		this._selector = selector;
	}

	SelfAxis.prototype = Object.create(Selector.prototype);
	SelfAxis.prototype.constructor = SelfAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	SelfAxis.prototype.matches = function (node, blueprint) {
		return this._selector.matches(node, blueprint);
	};

	SelfAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof SelfAxis &&
			this._selector.equals(otherSelector._selector);
	};

	SelfAxis.prototype.evaluate = function (nodeSequence, blueprint) {
		return new Sequence(nodeSequence.value.filter(function (node) {
			return this._selector.evaluate(Sequence.singleton(node), blueprint).getEffectiveBooleanValue();
		}.bind(this)));
	};

	return SelfAxis;
});
