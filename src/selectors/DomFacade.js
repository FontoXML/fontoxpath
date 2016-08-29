define([
	'fontoxml-dom-identification/getNodeId',
	'./dataTypes/AttributeNodeValue',
	'./dataTypes/NodeValue'
], function (
	getNodeId,
	AttributeNodeValue,
	NodeValue
) {
	'use strict';

	/**
	 * Facade for dom interface things, compatible with blueprintQuery. Pass a readonlyBlueprint to use the live DOM
	 */
	function DomFacade (blueprint) {
		this._blueprint = blueprint;

		this._createdNodeValuesByNodeId = Object.create(null);
	}

	function createNodeValue (domFacade, node) {
		var nodeId = getNodeId(node);
		var nodeValue = domFacade._createdNodeValuesByNodeId[nodeId];
		if (!nodeValue) {
			nodeValue = domFacade._createdNodeValuesByNodeId[nodeId] = new NodeValue(domFacade, node);
		}
		return nodeValue;
	}

	/**
	 * TODO: depTracking will be here
	 */
	DomFacade.prototype.getParentNode = function (node) {
		if (node instanceof AttributeNodeValue) {
			return createNodeValue(this, node.getParentNode());
		}
		return this._blueprint.getParentNode(node.value) &&
			createNodeValue(this, this._blueprint.getParentNode(node.value));
	};
	DomFacade.prototype.getFirstChild = function (node) {
		return this._blueprint.getFirstChild(node.value) &&
			createNodeValue(this, this._blueprint.getFirstChild(node.value));
	};

	DomFacade.prototype.getLastChild = function (node) {
		return this._blueprint.getLastChild(node.value) &&
			createNodeValue(this, this._blueprint.getLastChild(node.value));
	};

	DomFacade.prototype.getNextSibling = function (node) {
		return this._blueprint.getNextSibling(node.value) &&
			createNodeValue(this, this._blueprint.getNextSibling(node.value));
	};

	DomFacade.prototype.getPreviousSibling = function (node) {
		return this._blueprint.getPreviousSibling(node.value) &&
			createNodeValue(this, this._blueprint.getPreviousSibling(node.value));
	};

	DomFacade.prototype.getChildNodes = function (node) {
		var childNodes = [];

		for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	};

	DomFacade.prototype.getAttribute = function (node, attributeName) {
		var value = this._blueprint.getAttribute(node.value, attributeName);
		if (!value) {
			return null;
		}
		return new AttributeNodeValue(this, node.value, attributeName, value);
	};

	DomFacade.prototype.getAllAttributes = function (node) {
		return this._blueprint.getAllAttributes(node.value).map(function (attribute) {
			return new AttributeNodeValue(this, node.value, attribute.name, attribute.value);
		});
	};

	DomFacade.prototype.getData = function (node) {
		return this._blueprint.getData(node.value) || '';
	};

	return DomFacade;
});
