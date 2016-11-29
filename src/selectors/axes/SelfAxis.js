define([
	'../Selector',
	'../dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}  selector
	 */
	function SelfAxis (selector) {
		Selector.call(this, selector.specificity, Selector.RESULT_ORDER_SORTED);

		this._selector = selector;
	}

	SelfAxis.prototype = Object.create(Selector.prototype);
	SelfAxis.prototype.constructor = SelfAxis;

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

	SelfAxis.prototype.getBucket = function () {
		return this._selector.getBucket();
	};

	return SelfAxis;
});
