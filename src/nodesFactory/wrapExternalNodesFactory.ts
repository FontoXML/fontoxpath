import INodesFactory from './INodesFactory';

class WrappingNodesFactory implements INodesFactory {
	_externalNodesFactory:INodesFactory;

	constructor (externalNodesFactory) {
		this._externalNodesFactory = externalNodesFactory;
	}

	createAttributeNS (namespaceURI, name) {
		return this._externalNodesFactory['createAttributeNS'](namespaceURI, name);
	}

	createElementNS (namespaceURI, name) {
		return this._externalNodesFactory['createElementNS'](namespaceURI, name);
	}

	createComment (contents) {
		return this._externalNodesFactory['createComment'](contents);
	}

	createTextNode (contents) {
		return this._externalNodesFactory['createTextNode'](contents);
	}

	createProcessingInstruction (target, data) {
		return this._externalNodesFactory['createProcessingInstruction'](target, data);
	}
}

export default function wrapExternalDocumentWriter(externalNodesFactory) {
	return new WrappingNodesFactory(externalNodesFactory);
};
