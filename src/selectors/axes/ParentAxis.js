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
	 * @param  {Selector}  parentSelector
	 */
	function ParentAxis (parentSelector) {
		Selector.call(this, parentSelector.specificity, Selector.RESULT_ORDER_REVERSE_SORTED);

		this._parentSelector = parentSelector;
	}

	ParentAxis.prototype = Object.create(Selector.prototype);
	ParentAxis.prototype.constructor = ParentAxis;

	ParentAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof ParentAxis &&
			this._parentSelector.equals(otherSelector._parentSelector);
	};

	ParentAxis.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		var nodeValues = nodeSequence.value
			.map(function (nodeValue) {
				return new NodeValue(dynamicContext.domFacade, domFacade.getParentNode(nodeValue.value));
			})
			.filter(function (nodeValue) {
				if (!nodeValue) {
					return false;
				}
				var result = this._parentSelector.evaluate(dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(nodeValue),
						contextSequence: null
					}));
				return result.getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(nodeValues);
	};

	return ParentAxis;
});
