import IDocumentWriter from './IDocumentWriter';

class DomBackedDocumentWriter implements IDocumentWriter {
	public insertBefore(parent: Element, newNode: Node, referenceNode: Node) {
		return parent['insertBefore'](newNode, referenceNode);
	}

	public removeAttributeNS(node: Element, namespace: string, name: string) {
		return node['removeAttributeNS'](namespace, name);
	}

	public removeChild(parent: Element, child: Node) {
		return parent['removeChild'](child);
	}

	public setAttributeNS(node: Element, namespace: string, name: string, value: string) {
		node['setAttributeNS'](namespace, name, value);
	}

	public setData(node: Comment | Text | ProcessingInstruction, data: string) {
		node['data'] = data;
	}
}

export default new DomBackedDocumentWriter();
