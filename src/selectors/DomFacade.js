define([
	'fontoxml-dom-identification/getNodeId',
	'./dataTypes/AttributeNode'
], function (
	getNodeId,
	AttributeNode
) {
	'use strict';

	/**
	 * Facade for dom interface things, compatible with blueprintQuery. Pass a readonlyBlueprint to use the live DOM
	 */
	function DomFacade (blueprint) {
		this._blueprint = blueprint;

		this._createdNodeValuesByNodeId = Object.create(null);
	}

	/**
	 * TODO: depTracking will be here
	 */
	DomFacade.prototype.getParentNode = function (node) {
		if (node instanceof AttributeNode) {
			return node.getParentNode();
		}
		return this._blueprint.getParentNode(node);
	};

	DomFacade.prototype.getFirstChild = function (node) {
		if (node instanceof AttributeNode) {
			return null;
		}
		return this._blueprint.getFirstChild(node);
	};

	DomFacade.prototype.getLastChild = function (node) {
		if (node instanceof AttributeNode) {
			return null;
		}

		return this._blueprint.getLastChild(node);
	};

	DomFacade.prototype.getNextSibling = function (node) {
		if (node instanceof AttributeNode) {
			return null;
		}

		return this._blueprint.getNextSibling(node);
	};

	DomFacade.prototype.getPreviousSibling = function (node) {
		if (node instanceof AttributeNode) {
			return null;
		}

		return this._blueprint.getPreviousSibling(node);
	};

	DomFacade.prototype.getChildNodes = function (node) {
		if (node instanceof AttributeNode) {
			return [];
		}

		var childNodes = [];

		for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	};

	DomFacade.prototype.getAttribute = function (node, attributeName) {
		if (node instanceof AttributeNode) {
			return null;
		}

		var value = this._blueprint.getAttribute(node, attributeName);
		if (!value) {
			return null;
		}
		return new AttributeNode(node, attributeName, value);
	};

	DomFacade.prototype.getAllAttributes = function (node) {
		if (node instanceof AttributeNode) {
			return [];
		}

		return this._blueprint.getAllAttributes(node).map(function (attribute) {
			return new AttributeNode(node, attribute.name, attribute.value);
		});
	};

	DomFacade.prototype.getData = function (node) {
		if (node instanceof AttributeNode) {
			return node.value;
		}

		return this._blueprint.getData(node) || '';
	};

	return DomFacade;
});
