import INodesFactory from './INodesFactory';

class WrappingNodesFactory implements INodesFactory {
	private _externalNodesFactory: INodesFactory;

	constructor(externalNodesFactory) {
		this._externalNodesFactory = externalNodesFactory;
	}

	public createAttributeNS(namespaceURI, name) {
		return this._externalNodesFactory['createAttributeNS'](namespaceURI, name);
	}

	public createCDATASection(contents) {
		return this._externalNodesFactory['createCDATASection'](contents);
	}

	public createComment(contents) {
		return this._externalNodesFactory['createComment'](contents);
	}

	public createDocument() {
		return this._externalNodesFactory['createDocument']();
	}

	public createElementNS(namespaceURI, name) {
		return this._externalNodesFactory['createElementNS'](namespaceURI, name);
	}

	public createProcessingInstruction(target, data) {
		return this._externalNodesFactory['createProcessingInstruction'](target, data);
	}

	public createTextNode(contents) {
		return this._externalNodesFactory['createTextNode'](contents);
	}
}

export default function wrapExternalNodesFactory(externalNodesFactory) {
	return new WrappingNodesFactory(externalNodesFactory);
}
