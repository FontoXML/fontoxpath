define([
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./NodeValue',
	'./UntypedAtomicValue',
	'./StringValue'
], function (
	getNodeId,
	domInfo,
	NodeValue,
	UntypedAtomicValue,
	StringValue
) {
	'use strict';


	/**
	 * NodeValue: to provide a proxy to blueprints, and to (semi-properly) mix in attribute axis
	 */
	function AttributeNodeValue (blueprint, element, attributeName, attributeValue) {
		NodeValue.call(this, blueprint, attributeValue);

		this.name = attributeName;
		this.nodeId = getNodeId(element) + '@' + this.name;
		this._element = element;
	}

	AttributeNodeValue.prototype = Object.create(NodeValue.prototype);
	AttributeNodeValue.prototype.constructor = AttributeNodeValue;


	AttributeNodeValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'attribute()' ||
			NodeValue.prototype.instanceOfType(simpleTypeName);
	};

	AttributeNodeValue.prototype.getParentNode = function () {
		return this._element;
	};

	AttributeNodeValue.prototype.atomize = function () {
		// TODO: Mix in types
		return new UntypedAtomicValue(this.value);
	};

	AttributeNodeValue.prototype.getStringValue = function () {
		return new StringValue(this.value);
	};

	return AttributeNodeValue;
});
