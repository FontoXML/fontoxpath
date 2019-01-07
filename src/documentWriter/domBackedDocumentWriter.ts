import IDocumentWriter from './IDocumentWriter';

export default new class DomBackedDocumentWriter implements IDocumentWriter {
	insertBefore (parent, newNode, referenceNode) {
		return parent['insertBefore'](newNode, referenceNode);
	}

	removeAttributeNS (node, namespace, name) {
		return node['removeAttributeNS'](namespace, name);
	}

	removeChild (parent, child) {
		return parent['removeChild'](child);
	}

	setAttributeNS (node, namespace, name, value) {
		node['setAttributeNS'](namespace, name, value);
	}

	setData (node, data) {
		node['data'] = data;
	}
}();
