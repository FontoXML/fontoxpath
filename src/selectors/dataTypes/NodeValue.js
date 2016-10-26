define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./StringValue',
	'./AttributeNode',
	'./Item'
], function (
	blueprints,
	getNodeId,
	domInfo,
	StringValue,
	AttributeNode,
	Item
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function NodeValue (domFacade, node) {
		Item.call(this, node);
		this._domFacade = domFacade;
		this.nodeType = node.nodeType;
		if (node instanceof AttributeNode) {
			this.nodeId = node.nodeId;
		} else {
			this.nodeId = getNodeId(node);
		}

		if (this.value instanceof AttributeNode) {
			this.nodeName = this.value.nodeName;
		}
		else {
			switch (node.nodeType) {
				case 1:
					// element
					this.nodeName = this.value.nodeName;
					break;
				case 7:
					// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
					this.nodeName = this.value.target;
					break;
				default:
					// All other nodes have no name
					this.nodeName = null;
			}
		}
		this.target = node.target;
	}

	NodeValue.prototype = Object.create(Item.prototype);

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
				return Item.prototype.instanceOfType.call(this, simpleTypeName);
		}
	};

	// TODO: Dep tracking + findDescendants etc

	NodeValue.prototype.atomize = function () {
		// TODO: Mix in types, by default get string value
		if (this.value instanceof AttributeNode) {
			return this.value.atomize();
		}

		if (this.instanceOfType('text()')) {
			return new StringValue(this._domFacade.getData(this.value));
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
