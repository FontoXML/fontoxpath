define([
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./NodeValue',
	'./UntypedAtomicValue'
], function (
	getNodeId,
	domInfo,
	NodeValue,
	UntypedAtomicValue
) {
	'use strict';


	/**
	 * NodeValue: to provide a proxy to blueprints, and to (semi-properly) mix in attribute axis
	 */
	function AttributeNodeValue (blueprint, element, attributeName, attributeValue) {
		NodeValue.call(this, element, blueprint);

		this.nodeId = getNodeId(element) + '@' + attributeName;
		this.nodeType = 2;

		this.name = attributeName;
		this.value = attributeValue;
	}

	AttributeNodeValue.prototype = Object.create(NodeValue.prototype);
	AttributeNodeValue.prototype.constructor = AttributeNodeValue;

	Object.defineProperties(AttributeNodeValue.prototype, {
		data: {
			enumerable: true,
			get: function () {
				return this.value;
			}
		},

		length: {
			enumerable: true,
			get: function () {
				return this.value.length;
			}
		},

		attributes: {
			enumerable: true,
			get: function () {
				return null;
			}
		},

		childCount: {
			enumerable: true,
			get: function () {
				return 0;
			}
		},

		childElementCount: {
			enumerable: true,
			get: function () {
				return 0;
			}
		},

		parentNode: {
			enumerable: true,
			get: function () {
				return this._node;
			}
		},

		childNodes: {
			enumerable: true,
			get: function () {
				return [];
			}
		},

		nextSibling: {
			enumerable: true,
			get: function () {
				return null;
			}
		},

		previousSibling: {
			enumerable: true,
			get: function () {
				return null;
			}
		},

		firstChild: {
			enumerable: true,
			get: function () {
				return null;
			}
		},

		lastChild: {
			enumerable: true,
			get: function () {
				return null;

			}
		}
	});

	AttributeNodeValue.prototype.getAttribute = function (attributeName) {
		return null;
	};

	AttributeNodeValue.prototype.hasAttribute = function (attributeName) {
		return null;
	};

	// TODO: Dep tracking + findDescendants etc

	AttributeNodeValue.prototype.atomize = function () {
		// TODO: Mix in types
		return new UntypedAtomicValue(this.value);
	};

	return AttributeNodeValue;
});
