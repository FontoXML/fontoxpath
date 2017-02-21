/**
 * @constructor
 * @implements {IDomFacade}
 */
function ReadOnlyDomFacade () {
}

ReadOnlyDomFacade.prototype.getParentNode = (node) => {
	return node.parentNode;
};

ReadOnlyDomFacade.prototype.getFirstChild = function (node) {
	return node.firstChild;
};

ReadOnlyDomFacade.prototype.getLastChild = function (node) {
	return node.lastChild;
};

ReadOnlyDomFacade.prototype.getNextSibling = function (node) {
	return node.nextSibling;
};

ReadOnlyDomFacade.prototype.getPreviousSibling = function (node) {
	return node.previousSibling;
};

ReadOnlyDomFacade.prototype.getChildNodes = function (node) {
	var childNodes = [];

	for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
		childNodes.push(childNode);
	}

	return childNodes;
};

ReadOnlyDomFacade.prototype.getAttribute = function (node, attributeName) {
	return node.getAttribute(attributeName);
};

ReadOnlyDomFacade.prototype.getAllAttributes = function (node) {
	return Array.from(/** @type {!Iterable<Attr>} */ (node.attributes));
};

ReadOnlyDomFacade.prototype.getData = function (node) {
	return node.data || '';
};

ReadOnlyDomFacade.prototype.getRelatedNodes = function (node, callback) {
	return callback(node, this);
};

export default new ReadOnlyDomFacade();
