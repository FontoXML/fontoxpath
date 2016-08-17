define([
	'../selectors/Selector',
	'../selectors/dataTypes/Sequence',
	'../selectors/dataTypes/NodeValue'
], function (
	Selector,
	Sequence,
	NodeValue
) {
	'use strict';

	function WrappingSelector (selectorToWrap) {
		this._selectorToWrap = selectorToWrap;
	}
	WrappingSelector.prototype = Object.create(Selector.prototype);
	WrappingSelector.prototype.constructor = WrappingSelector;
	WrappingSelector.prototype.matches = function (node, blueprint) {
		var result = this._selectorToWrap.evaluate(Sequence.singleton(new NodeValue(node, blueprint)), blueprint);

		return result.getEffectiveBooleanValue();
	};

	WrappingSelector.prototype.evaluate = function (sequence, blueprint) {
		return this._selectorToWrap.evaluate(sequence, blueprint);
	};

	return WrappingSelector;
});
