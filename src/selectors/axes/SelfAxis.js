define([
	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/NodeValue'
], function (
	Selector,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * @param  {Selector}  childSelector
	 */
	function SelfAxis (selector) {
		Selector.call(this, selector.specificity, Selector.RESULT_ORDER_SORTED);

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

	SelfAxis.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem;

		return new Sequence(nodeSequence.value.filter(function (nodeValue) {
			return this._selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(nodeValue),
				contextSequence: nodeSequence
			})).getEffectiveBooleanValue();
		}.bind(this)));
	};

	return SelfAxis;
});
