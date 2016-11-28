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
	 * @param  {Selector}  siblingSelector
	 */
	function FollowingSiblingAxis (siblingSelector) {
		Selector.call(this, siblingSelector.specificity, Selector.RESULT_ORDER_SORTED);

		this._siblingSelector = siblingSelector;
	}

	FollowingSiblingAxis.prototype = Object.create(Selector.prototype);
	FollowingSiblingAxis.prototype.constructor = FollowingSiblingAxis;

	/**
	 * @param  {Selector}  otherSelector
	 */
	FollowingSiblingAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof FollowingSiblingAxis &&
			this._siblingSelector.equals(otherSelector._siblingSelector);
	};

	FollowingSiblingAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		function isMatchingSibling (selector, node) {
			return selector.evaluate(dynamicContext.createScopedContext({
				contextItem: Sequence.singleton(new NodeValue(dynamicContext.domFacade, node)),
				contextSequence: null
			})).getEffectiveBooleanValue();
		}

		var sibling = contextItem.value[0].value;
		var nodes = [];
		while ((sibling = domFacade.getNextSibling(sibling))) {
			if (!isMatchingSibling(this._siblingSelector, sibling)) {
				continue;
			}
			nodes.push(new NodeValue(dynamicContext.domFacade, sibling));
		}
		return new Sequence(nodes);
	};

	return FollowingSiblingAxis;
});
