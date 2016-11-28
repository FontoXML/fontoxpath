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
	function ChildAxis (childSelector) {
		Selector.call(this, childSelector.specificity, Selector.RESULT_ORDER_SORTED);

		this._childSelector = childSelector;
	}

	ChildAxis.prototype = Object.create(Selector.prototype);
	ChildAxis.prototype.constructor = ChildAxis;

	ChildAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ChildAxis &&
			this._childSelector.equals(otherSelector._childSelector);
	};

	ChildAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;
		var nodeValues = domFacade.getChildNodes(contextItem.value[0].value)
			.filter(function (node) {
				return this._childSelector.evaluate(
					dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
						contextSequence: null
					})).getEffectiveBooleanValue();
			}.bind(this))
			.map(function (node) {
				return new NodeValue(dynamicContext.domFacade, node);
			});

		return new Sequence(nodeValues);
	};

	return ChildAxis;
});
