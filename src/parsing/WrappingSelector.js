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
		var result = this._selectorToWrap.evaluate({
				contextItem: Sequence.singleton(new NodeValue(node, blueprint)),
				contextSequence: null,
				blueprint: blueprint
			});

		return result.getEffectiveBooleanValue();
	};

	WrappingSelector.prototype.evaluate = function (dynamicContext) {
		return this._selectorToWrap.evaluate(dynamicContext);
	};

	return WrappingSelector;
});
