define([
	'../Selector',
	'../dataTypes/Sequence'
], function (
	Selector,
	Sequence
) {
	'use strict';

	/**
	 * @param  {Selector}  parentSelector
	 */
	function ParentAxis (parentSelector) {
		Selector.call(this, parentSelector.specificity);

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
				return domFacade.getParentNode(nodeValue);
			})
			.filter(function (node) {
				var result = this._parentSelector.evaluate(dynamicContext.createScopedContext({
						contextItem: Sequence.singleton(node),
						contextSequence: null
					}));
				return result.getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(nodeValues);
	};

	return ParentAxis;
});
