import IDocumentWriter from './IDocumentWriter';

class WrappingDocumentWriter implements IDocumentWriter {
	_externalDocumentWriter: IDocumentWriter;

	constructor (externalDocumentWriter) {
		this._externalDocumentWriter = externalDocumentWriter;
	}

	insertBefore (parent, newNode, referenceNode) {
		return this._externalDocumentWriter['insertBefore'](parent, newNode, referenceNode);
	}

	removeAttributeNS (node, namespace, name) {
		return this._externalDocumentWriter['removeAttributeNS'](node, namespace, name);
	}

	removeChild (parent, child) {
		return this._externalDocumentWriter['removeChild'](parent, child);
	}

	setAttributeNS (node, namespace, name, value) {
		this._externalDocumentWriter['setAttributeNS'](node, namespace, name, value);
	}

	setData (node, data) {
		this._externalDocumentWriter['setData'](node, data);
	}
}

export default function wrapExternalDocumentWriter (externalDocumentWriter) {
	return new WrappingDocumentWriter(externalDocumentWriter);
}
