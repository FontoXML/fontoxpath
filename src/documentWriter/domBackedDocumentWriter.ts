import IDocumentWriter from './IDocumentWriter';

class DomBackedDocumentWriter implements IDocumentWriter {
	public insertBefore(parent, newNode, referenceNode) {
		return parent['insertBefore'](newNode, referenceNode);
	}

	public removeAttributeNS(node, namespace, name) {
		return node['removeAttributeNS'](namespace, name);
	}

	public removeChild(parent, child) {
		return parent['removeChild'](child);
	}

	public setAttributeNS(node, namespace, name, value) {
		node['setAttributeNS'](namespace, name, value);
	}

	public setData(node, data) {
		node['data'] = data;
	}
}

export default new DomBackedDocumentWriter();
