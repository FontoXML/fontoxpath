import INodesFactory from './INodesFactory';

class WrappingNodesFactory implements INodesFactory {
	private _externalNodesFactory: INodesFactory;

	constructor(externalNodesFactory: INodesFactory) {
		this._externalNodesFactory = externalNodesFactory;
	}

	public createAttributeNS(namespaceURI: string, name: string) {
		return this._externalNodesFactory['createAttributeNS'](namespaceURI, name);
	}

	public createCDATASection(contents: string) {
		return this._externalNodesFactory['createCDATASection'](contents);
	}

	public createComment(contents: string) {
		return this._externalNodesFactory['createComment'](contents);
	}

	public createDocument() {
		return this._externalNodesFactory['createDocument']();
	}

	public createElementNS(namespaceURI: string, name: string) {
		return this._externalNodesFactory['createElementNS'](namespaceURI, name);
	}

	public createProcessingInstruction(target: string, data: string) {
		return this._externalNodesFactory['createProcessingInstruction'](target, data);
	}

	public createTextNode(contents: string) {
		return this._externalNodesFactory['createTextNode'](contents);
	}
}

export default function wrapExternalNodesFactory(externalNodesFactory: INodesFactory) {
	return new WrappingNodesFactory(externalNodesFactory);
}
