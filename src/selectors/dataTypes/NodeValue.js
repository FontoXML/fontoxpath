define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo',
	'./Sequence',
	'./StringValue',
	'./Value'
], function (
	blueprints,
	getNodeId,
	domInfo,
	Sequence,
	StringValue,
	Value
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * NodeValue: to provide a proxy to blueprints, and to (semi-properly) mix in attribute axis
	 */
	function NodeValue (node, blueprint) {
		Value.call(this, null);
		this._node = node;
		this._blueprint = blueprint;

		this.nodeId = getNodeId(node);
		this.ownerDocument = domInfo.isDocument(node) ?
			null :
			new NodeValue(node.ownerDocument, this._sideEffects, this._flags, this._blueprint);
		this.nodeType = node.nodeType;

		// For elements
		this.nodeName = node.nodeName;

		// For processing instructions
		this.target = node.target;

		// For document types
		this.name = node.name;
		this.publicId = node.publicId;
		this.systemId = node.systemId;
	}

	NodeValue.prototype = Object.create(Value.prototype);
	NodeValue.prototype.constructor = NodeValue;

	Object.defineProperties(NodeValue.prototype, {
		/**
		 * Returns the node's data, assuming it is a CharacterData instance.
		 *
		 * @type {String}
		 */
		data: {
			enumerable: true,
			get: function () {
				return this._blueprint.getData(this._node);
			}
		},

		/**
		 * Returns the length of the node, assuming it is a CharacterData instance.
		 *
		 * @type {number}
		 */
		length: {
			enumerable: true,
			get: function () {
				return this._blueprint.getLength(this._node);
			}
		},

		/**
		 * Returns the node's attributes, assuming it is an Element.
		 *
		 * @type {Attr[]}
		 */
		attributes: {
			enumerable: true,
			get: function () {
				return this._blueprint.getAttributes(this._node);
			}
		},

		/**
		 * Returns the number of child nodes of the node.
		 *
		 * @type {number}
		 */
		childCount: {
			enumerable: true,
			get: function () {
				return this._blueprint.getChildNodes(this._node).length;
			}
		},

		/**
		 * Returns the number of child elements of the node, assuming it is an Element.
		 *
		 * @type {number}
		 */
		childElementCount: {
			enumerable: true,
			get: function () {
				return this._blueprint.getChildElementCount(this._node);
			}
		},

		/**
		 * Returns a NodeValue for the parentNode of this node.
		 *
		 * As getting to the childNode already depends on the childlist of the parent, this does not need to
		 * introduce additional dependencies itself.
		 *
		 * @type {NodeValue}
		 */
		parentNode: {
			enumerable: true,
			get: function () {
				return this._blueprint.getParentNode(this._node) && new NodeValue(this._blueprint.getParentNode(this._node), this._blueprint);
			}
		},
		/**
		 *) NodeProxies for all childNodes under the current node
		 *
		 * This introduces dependencies on the childNodes property of this node
		 */
		childNodes: {
			enumerable: true,
			get: function () {
				return new this._blueprint.getChildNodes(this._node).map(function (node) {
					return new NodeValue(node, this._blueprint);
					}.bind(this));
			}
		},

		/**
		 * Returns a nodeProxy for the next sibling of the current node
		 *
		 * This introduces dependencies on the childNodes property of this node's parentNode
		 */
		nextSibling: {
			enumerable: true,
			get: function () {
				return this._blueprint.getNextSibling(this._node) &&
					new NodeValue(this._blueprint.getNextSibling(this._node), this._blueprint);
			}
		},

		/**
		 * Returns a nodeProxy for the previous sibling of the current node
		 *
		 * This introduces dependencies on the childNodes property of this node's parentNode
		 */
		previousSibling: {
			enumerable: true,
			get: function () {
				return this._blueprint.getPreviousSibling(this._node) &&
					new NodeValue(this._blueprint.getPreviousSibling(this._node), this._blueprint);

			}
		},

		/**
		 * Returns a nodeProxy for the first child of the current node
		 *
		 * This introduces dependencies on the childNodes property of this node
		 */
		firstChild: {
			enumerable: true,
			get: function () {
				return this._blueprint.getFirstChild(this._node) &&
					new NodeValue(this._blueprint.getFirstChild(this._node), this._blueprint);
			}
		},

		/**
		 * Returns a nodeProxy for the first child of the current node
		 *
		 * This introduces dependencies on the childNodes property of this node
		 */
		lastChild: {
			enumerable: true,
			get: function () {
				return this._blueprint.getLastChild(this._node) &&
					new NodeValue(this._blueprint.getLastChild(this._node), this._blueprint);

			}
		}
	});

	NodeValue.prototype.getAttribute = function (attributeName) {
		return this._blueprint.getAttribute(this._node, attributeName);
	};

	NodeValue.prototype.hasAttribute = function (attributeName) {
		return this._blueprint.getAttribute(this._node, attributeName) !== null;
	};

	NodeValue.prototype.getUserData = function (key) {
		return this._node.getUserData(key);
	};

	NodeValue.prototype.instanceOfType = function (simpleTypeName) {
		return simpleTypeName === 'node()' ||
			Value.prototype.instanceOfType(simpleTypeName);
	};

	// TODO: Dep tracking + findDescendants etc

	NodeValue.prototype.atomize = function () {
		// TODO: Mix in types, by default get string value
		return new StringValue(blueprintQuery.getTextContent(this._blueprint, this._node));
	};

	return NodeValue;
});
