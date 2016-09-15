define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./StringValue',
	'./AttributeNode',
	'./Value'
], function (
	blueprints,
	getNodeId,
	domInfo,
	StringValue,
	AttributeNode,
	Value
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function NodeValue (domFacade, node) {
		Value.call(this, node);
		this._domFacade = domFacade;
		this.nodeType = node.nodeType;
		if (node instanceof AttributeNode) {
			this.nodeId = node.nodeId;
		} else {
			this.nodeId = getNodeId(node);
		}
		this.nodeName = node.nodeName;
		this.target = node.target;
	}

	NodeValue.prototype = Object.create(Value.prototype);

	NodeValue.prototype.instanceOfType = function (simpleTypeName) {
		switch(simpleTypeName) {
			case 'node()':
				return true;
			case 'element()':
				return domInfo.isElement(this.value);
			case 'attribute()':
				return this.value instanceof AttributeNode;
			case 'document()':
				return domInfo.isDocument(this.value);
			case 'comment()':
				return domInfo.isComment(this.value);
			case 'processing-instruction()':
				return domInfo.isProcessingInstruction(this.value);
			case 'text()':
				return domInfo.isTextNode(this.value);
			default:
				return Value.prototype.instanceOfType(simpleTypeName);
		}
	};

	// TODO: Dep tracking + findDescendants etc

	NodeValue.prototype.atomize = function () {
		// TODO: Mix in types, by default get string value
		if (this.value instanceof AttributeNode) {
			return this.value.atomize();
		}

		var allTextNodes = blueprintQuery.findDescendants(this._domFacade, this.value, domInfo.isTextNode);
		return new StringValue(allTextNodes.map(function (textNode) {
				return this._domFacade.getData(textNode);
		}.bind(this)).join(''));
	};

	NodeValue.prototype.getStringValue = function () {
		if (this.value instanceof AttributeNode) {
			return this.value.getStringValue();
		}

		return this.atomize();
	};

	return NodeValue;
});
