/**
 * @constructor
 * @implements {IDomFacade}
 */
function DomBackedDomFacade () {
}

DomBackedDomFacade.prototype.getParentNode = (node) => {
	if (node.nodeType === 2) {
		return /** @type {!Attr} */(node).ownerElement;
	}
	return node.parentNode;
};

DomBackedDomFacade.prototype.getFirstChild = function (node) {
	return node.firstChild;
};

DomBackedDomFacade.prototype.getLastChild = function (node) {
	return node.lastChild;
};

DomBackedDomFacade.prototype.getNextSibling = function (node) {
	return node.nextSibling;
};

DomBackedDomFacade.prototype.getPreviousSibling = function (node) {
	return node.previousSibling;
};

DomBackedDomFacade.prototype.getChildNodes = function (node) {
	var childNodes = [];

	for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
		childNodes.push(childNode);
	}

	return childNodes;
};

DomBackedDomFacade.prototype.getAttribute = function (node, attributeName) {
	if (node.nodeType === 2) {
		return null;
	}
	return node.getAttribute(attributeName);
};

DomBackedDomFacade.prototype.getAllAttributes = function (node) {
	if (node.nodeType === 2) {
		return [];
	}

	return Array.from(/** @type {!Iterable<Attr>} */ (node.attributes));
};

DomBackedDomFacade.prototype.getData = function (node) {
	return node.data || '';
};

DomBackedDomFacade.prototype.getRelatedNodes = function (node, callback) {
	return callback(node, this);
};

export default new DomBackedDomFacade();
