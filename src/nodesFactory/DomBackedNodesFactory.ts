import INodesFactory from './INodesFactory';

export default class DomBackedNodesFactory implements INodesFactory {
	_documentNode:Document|null;

	constructor (contextItem: any) {
		if (contextItem && 'nodeType' in (contextItem)) {
			const ownerDocument = (contextItem.ownerDocument || contextItem);
			if ((typeof ownerDocument.createElementNS === 'function') &&
				(typeof ownerDocument.createProcessingInstruction === 'function') &&
				(typeof ownerDocument.createTextNode === 'function') &&
				(typeof ownerDocument.createComment === 'function')) {
				this._documentNode = ownerDocument;
			}
		}

		if (!this._documentNode) {
			this._documentNode = null;
		}
	}

	createAttributeNS (namespaceURI, name) {
		if (!this._documentNode) {
			throw new Error('Please pass a node factory if an XQuery script uses node constructors');
		}
		return this._documentNode.createAttributeNS(namespaceURI, name);
	}

	createElementNS (namespaceURI, name) {
		if (!this._documentNode) {
			throw new Error('Please pass a node factory if an XQuery script uses node constructors');
		}
		return this._documentNode.createElementNS(namespaceURI, name);
	}

	createComment (contents) {
		if (!this._documentNode) {
			throw new Error('Please pass a node factory if an XQuery script uses node constructors');
		}
		return this._documentNode.createComment(contents);
	}

	createTextNode (contents) {
		if (!this._documentNode) {
			throw new Error('Please pass a node factory if an XQuery script uses node constructors');
		}
		return this._documentNode.createTextNode(contents);
	}

	createProcessingInstruction (target, data) {
		if (!this._documentNode) {
			throw new Error('Please pass a node factory if an XQuery script uses node constructors');
		}
		return this._documentNode.createProcessingInstruction(target, data);
	}
}
