define([
	'fontoxml-dom-utils/domInfo',

	'../Selector',
	'../Specificity',
	'../isSameArray',
	'../dataTypes/Sequence',
	'../dataTypes/NodeValue',
	'../dataTypes/AttributeNode'
], function (
	domInfo,

	Selector,
	Specificity,
	isSameArray,
	Sequence,
	NodeValue,
	AttributeNode
) {
	'use strict';

	/**
	 * @param  {Selector}    attributeTestSelector
	 */
	function AttributeAxis (attributeTestSelector) {
		Selector.call(this, new Specificity({attribute: 1}), Selector.RESULT_ORDER_UNSORTED);

		this._attributeTestSelector = attributeTestSelector;
	}

	AttributeAxis.prototype = Object.create(Selector.prototype);
	AttributeAxis.prototype.constructor = AttributeAxis;

	AttributeAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AttributeAxis &&
			this._attributeTestSelector.equals(otherSelector._attributeTestSelector);
	};

	AttributeAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		if (!contextItem.value[0].instanceOfType('element()')) {
			return Sequence.empty();
		}

		var attributes = domFacade
			.getAllAttributes(contextItem.value[0].value)
			.map(function (attribute) {
				return new NodeValue(domFacade, new AttributeNode(
					contextItem.value[0].value,
					attribute.name,
					attribute.value
				));
			}).filter(function (attributeNodeValue) {
				var scopedContext = dynamicContext.createScopedContext({ contextItem: Sequence.singleton(attributeNodeValue) });
				return this._attributeTestSelector.evaluate(scopedContext).getEffectiveBooleanValue();
			}.bind(this));

		return new Sequence(attributes);
	};

	return AttributeAxis;
});
