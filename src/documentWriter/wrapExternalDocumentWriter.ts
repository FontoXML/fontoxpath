import { Document, Element, Node } from '../types/Types';
import IDocumentWriter from './IDocumentWriter';
class WrappingDocumentWriter implements IDocumentWriter {
	private _externalDocumentWriter: IDocumentWriter;

	constructor(externalDocumentWriter: IDocumentWriter) {
		this._externalDocumentWriter = externalDocumentWriter;
	}

	public insertBefore(parent: Element | Document, newNode: Node, referenceNode: Node) {
		return this._externalDocumentWriter['insertBefore'](parent, newNode, referenceNode);
	}

	public removeAttributeNS(node: Element, namespace: string, name: string) {
		return this._externalDocumentWriter['removeAttributeNS'](node, namespace, name);
	}

	public removeChild(parent: Element | Document, child: Node) {
		return this._externalDocumentWriter['removeChild'](parent, child);
	}

	public setAttributeNS(node: Element, namespace: string, name: string, value: string) {
		this._externalDocumentWriter['setAttributeNS'](node, namespace, name, value);
	}

	public setData(node: Node, data: string) {
		this._externalDocumentWriter['setData'](node, data);
	}
}

export default function wrapExternalDocumentWriter(externalDocumentWriter: IDocumentWriter) {
	return new WrappingDocumentWriter(externalDocumentWriter);
}
