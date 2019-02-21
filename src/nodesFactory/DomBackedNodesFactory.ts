import INodesFactory from './INodesFactory';

export default class DomBackedNodesFactory implements INodesFactory {
	private _documentNode: Document | null;

	constructor(contextItem: any) {
		if (contextItem && 'nodeType' in contextItem) {
			const ownerDocument = contextItem.ownerDocument || contextItem;
			if (
				typeof ownerDocument.createElementNS === 'function' &&
				typeof ownerDocument.createProcessingInstruction === 'function' &&
				typeof ownerDocument.createTextNode === 'function' &&
				typeof ownerDocument.createComment === 'function'
			) {
				this._documentNode = ownerDocument;
			}
		}

		if (!this._documentNode) {
			this._documentNode = null;
		}
	}

	public createAttributeNS(namespaceURI, name) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createAttributeNS(namespaceURI, name);
	}

	public createCDATASection(contents) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createCDATASection(contents);
	}

	public createComment(contents) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createComment(contents);
	}

	public createElementNS(namespaceURI, name) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createElementNS(namespaceURI, name);
	}

	public createProcessingInstruction(target, data) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createProcessingInstruction(target, data);
	}

	public createTextNode(contents) {
		if (!this._documentNode) {
			throw new Error(
				'Please pass a node factory if an XQuery script uses node constructors'
			);
		}
		return this._documentNode.createTextNode(contents);
	}
}
