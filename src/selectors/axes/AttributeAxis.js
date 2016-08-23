define([
	'fontoxml-dom-utils/domInfo',

	'../Selector',
	'../Specificity',
	'../isSameArray',
	'../dataTypes/Sequence',
	'../dataTypes/AttributeNodeValue'
], function (
	domInfo,

	Selector,
	Specificity,
	isSameArray,
	Sequence,
	AttributeNodeValue
) {
	'use strict';

	/**
	 * @param  {String}    attributeName
	 * @param  {String[]}  [attributeValues]  if omitted, the selector matches if the attribute is present
	 */
	function AttributeAxis (attributeName, attributeValues) {
		Selector.call(this, new Specificity({attribute: 1}));

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
		var nodeSequence = dynamicContext.contextItem,
			blueprint = dynamicContext.domFacade;

		return new Sequence(nodeSequence.value.reduce(function (values, nodeValue) {
			var attributeValue = blueprint.getAttribute(nodeValue, this._attributeName);
			if (attributeValue) {
				values.push(attributeValue);
			}
			return values;
		}.bind(this), []));
	};

	return AttributeAxis;
});
