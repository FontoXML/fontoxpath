define([
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./UntypedAtomicValue',
	'./StringValue'
], function (
	getNodeId,
	domInfo,
	UntypedAtomicValue,
	StringValue
) {
	'use strict';


	function AttributeNode (element, attributeName, attributeValue) {
		this.value = attributeValue;
		this.name = attributeName;
		this.nodeId = getNodeId(element) + '@' + this.name;
		this._element = element;
	}

	AttributeNode.prototype.getParentNode = function () {
		return this._element;
	};

	AttributeNode.prototype.atomize = function () {
		// TODO: Mix in types
		return new UntypedAtomicValue(this.value);
	};

	AttributeNode.prototype.getStringValue = function () {
		return new StringValue(this.value);
	};

	return AttributeNode;
});
