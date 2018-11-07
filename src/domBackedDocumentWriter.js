/**
 * @constructor
 * @implements {IDocumentWriter}
 */
function DomBackedDocumentWriter () {
}

DomBackedDocumentWriter.prototype.removeChild = (parent, child) => {
	return parent.removeChild(child);
};

DomBackedDocumentWriter.prototype.insertBefore = function (parent, newNode, referenceNode) {
	return parent.insertBefore(newNode, referenceNode);
};

export default new DomBackedDocumentWriter();
