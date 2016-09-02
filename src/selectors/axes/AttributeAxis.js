define([
	'fontoxml-dom-utils/domInfo',

	'../Selector',
	'../Specificity',
	'../isSameArray',
	'../dataTypes/Sequence',
	'../dataTypes/NodeValue'
], function (
	domInfo,

	Selector,
	Specificity,
	isSameArray,
	Sequence,
	NodeValue
) {
	'use strict';

	/**
	 * @param  {String}    attributeName
	 * @param  {String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present. Deprecated
	 */
	function AttributeAxis (attributeName, attributeValues) {
		Selector.call(this, new Specificity({attribute: 1}), Selector.RESULT_ORDER_UNSORTED);

		this._attributeName = attributeName;
		this._attributeValues = attributeValues && attributeValues.concat().sort();
	}

	AttributeAxis.prototype = Object.create(Selector.prototype);
	AttributeAxis.prototype.constructor = AttributeAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AttributeAxis.prototype.matches = function (node, blueprint) {
		if (!domInfo.isElement(node)) {
			// We can only traverse the attribute axis of element nodes
			return false;
		}
		if (this._attributeValues === undefined) {
			return blueprint.getAttribute(node, this._attributeName) !== null;
		}

		return this._attributeValues.some(function (attributeValue) {
			return blueprint.getAttribute(node, this._attributeName) === attributeValue;
		}.bind(this));
	};

	AttributeAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		if ((this._attributeValues && !otherSelector._attributeValues) ||
			(!this._attributeValues && otherSelector._attributeValues)) {
			return false;
		}

		return this._attributeName === otherSelector._attributeName &&
			isSameArray(this._attributeValues, otherSelector._attributeValues);
	};

	AttributeAxis.prototype.evaluate = function (dynamicContext) {
		var contextItem = dynamicContext.contextItem,
			domFacade = dynamicContext.domFacade;

		if (!contextItem.value[0].instanceOfType('element()')) {
			// Only elements can have attributes
			return Sequence.empty();
		}

		var attributeNode = domFacade.getAttribute(contextItem.value[0].value, this._attributeName);
		if (!attributeNode) {
			return Sequence.empty();
		}
		return Sequence.singleton(new NodeValue(domFacade, attributeNode));
	};

	return AttributeAxis;
});
