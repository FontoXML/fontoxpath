/**
 * @class
 * @implements {IDocumentWriter}
 */
export default new class DomBackedDocumentWriter {
	insertBefore (parent, newNode, referenceNode) {
		return parent.insertBefore(newNode, referenceNode);
	}

	removeChild (parent, child) {
		return parent.removeChild(child);
	}

	setAttributeNS (node, namespace, name, value) {
		node.setAttributeNS(namespace, name, value);
	}

	setData (node, data) {
		node.data = data;
	}
}();
