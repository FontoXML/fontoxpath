define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./StringValue',
	'./Value'
], function (
	blueprints,
	getNodeId,
	domInfo,
	StringValue,
	Value
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	function NodeValue (domFacade, node) {
		Value.call(this, node);
		this._domFacade = domFacade;
		this.nodeType = node.nodeType;
		if (typeof node !== 'string') {
			this.nodeId = getNodeId(node);
		}
		this.nodeName = node.nodeName;
		this.target = node.target;
	}

	NodeValue.prototype = Object.create(Value.prototype);

	NodeValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'node()' ||
			Value.prototype.instanceOfType(simpleTypeName);
	};

	// TODO: Dep tracking + findDescendants etc

	NodeValue.prototype.atomize = function () {
		// TODO: Mix in types, by default get string value
		return new StringValue(blueprintQuery.getTextContent(this._domFacade, this));
	};

	NodeValue.prototype.getStringValue = function () {
		return this.atomize();
	};

	return NodeValue;
});
