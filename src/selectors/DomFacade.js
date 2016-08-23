define([
	'./dataTypes/AttributeNodeValue',
	'./dataTypes/NodeValue'
], function (
	AttributeNodeValue,
	NodeValue
) {
	'use strict';

	/**
	 * Facade for dom interface things, compatible with blueprintQuery. Pass a readonlyBlueprint to use the live DOM
	 */
	function DomFacade (blueprint) {
		this._blueprint = blueprint;
	}

	/**
	 * TODO: depTracking will be here
	 */
	DomFacade.prototype.getParentNode = function (node) {
		if (node instanceof AttributeNodeValue) {
			return new NodeValue(this, node.getParentNode());
		}
		return this._blueprint.getParentNode(node.value) &&
			new NodeValue(this, this._blueprint.getParentNode(node.value));
	};
	DomFacade.prototype.getFirstChild = function (node) {
		return this._blueprint.getFirstChild(node.value) &&
			new NodeValue(this, this._blueprint.getFirstChild(node.value));
	};

	DomFacade.prototype.getLastChild = function (node) {
		return this._blueprint.getLastChild(node.value) &&
			new NodeValue(this, this._blueprint.getLastChild(node.value));
	};

	DomFacade.prototype.getNextSibling = function (node) {
		return this._blueprint.getNextSibling(node.value) &&
			new NodeValue(this, this._blueprint.getNextSibling(node.value));
	};

	DomFacade.prototype.getPreviousSibling = function (node) {
		return this._blueprint.getPreviousSibling(node.value) &&
			new NodeValue(this, this._blueprint.getPreviousSibling(node.value));
	};

	DomFacade.prototype.getChildNodes = function (node) {
		var childNodes = [];

		for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	};

	DomFacade.prototype.getAttribute = function (node, attributeName) {
		return new AttributeNodeValue(this, node.value, attributeName, this._blueprint.getAttribute(node.value, attributeName));
	};

	DomFacade.prototype.getAllAttributes = function (node) {
		return this._blueprint.getAllAttributes(node.value).map(function (attribute) {
			return new AttributeNodeValue(this, node.value, attribute.name, attribute.value);
		});
	};

	DomFacade.prototype.getData = function (node) {
		return new NodeValue(this, this._blueprint.getData(node.value) || '');
	};

	return DomFacade;
});
