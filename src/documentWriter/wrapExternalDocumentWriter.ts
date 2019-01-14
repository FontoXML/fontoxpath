import IDocumentWriter from './IDocumentWriter';

class WrappingDocumentWriter implements IDocumentWriter {
	private _externalDocumentWriter: IDocumentWriter;

	constructor(externalDocumentWriter) {
		this._externalDocumentWriter = externalDocumentWriter;
	}

	public insertBefore(parent, newNode, referenceNode) {
		return this._externalDocumentWriter['insertBefore'](parent, newNode, referenceNode);
	}

	public removeAttributeNS(node, namespace, name) {
		return this._externalDocumentWriter['removeAttributeNS'](node, namespace, name);
	}

	public removeChild(parent, child) {
		return this._externalDocumentWriter['removeChild'](parent, child);
	}

	public setAttributeNS(node, namespace, name, value) {
		this._externalDocumentWriter['setAttributeNS'](node, namespace, name, value);
	}

	public setData(node, data) {
		this._externalDocumentWriter['setData'](node, data);
	}
}

export default function wrapExternalDocumentWriter(externalDocumentWriter) {
	return new WrappingDocumentWriter(externalDocumentWriter);
}
