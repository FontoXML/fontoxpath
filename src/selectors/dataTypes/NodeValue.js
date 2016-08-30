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
		return simpleTypeName === 'node()' ||
			this.value instanceof AttributeNode && simpleTypeName === 'attribute()' ||
			Value.prototype.instanceOfType(simpleTypeName);
	};

	// TODO: Dep tracking + findDescendants etc

	NodeValue.prototype.atomize = function () {
		// TODO: Mix in types, by default get string value
		if (this.value instanceof AttributeNode) {
			return this.value.atomize();
		}

		return new StringValue(blueprintQuery.getTextContent(this._domFacade, this.value));
	};

	NodeValue.prototype.getStringValue = function () {
		if (this.value instanceof AttributeNode) {
			return this.value.getStringValue();
		}

		return this.atomize();
	};

	return NodeValue;
});
