define([
	'../selectors/DynamicContext',
	'../selectors/Selector',
	'../selectors/dataTypes/Sequence',
	'../selectors/dataTypes/NodeValue'
], function (
	DynamicContext,
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
		var result = this._selectorToWrap.evaluate(new DynamicContext({
				contextItem: Sequence.singleton(new NodeValue(node, blueprint)),
				contextSequence: null,
				blueprint: blueprint,
				variables: {}
			}));

		return result.getEffectiveBooleanValue();
	};

	WrappingSelector.prototype.evaluate = function (dynamicContext) {
		return this._selectorToWrap.evaluate(dynamicContext);
	};

	return WrappingSelector;
});
