const warningDocumentNode = {
	createAttributeNS: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createElementNS: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createTextNode: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createComment: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	},
	createProcessingInstruction: () => {
		throw new Error('Please pass a node factory if an XQuery script uses node constructors');
	}
};

/**
 * @class
 * @implements {INodesFactory}
 */
export default class DomBackedNodesFactory {
	constructor (contextItem) {
		if (contextItem && 'nodeType' in /** @type {!Node} */(contextItem)) {
			const ownerDocument = /** @type {Document} }*/(contextItem.ownerDocument || contextItem);
			if ((typeof ownerDocument.createElementNS === 'function') &&
				(typeof ownerDocument.createProcessingInstruction === 'function') &&
				(typeof ownerDocument.createTextNode === 'function') &&
				(typeof ownerDocument.createComment === 'function')) {
				this._documentNode = ownerDocument;
			}
		}

		if (!this._documentNode) {
			this._documentNode = warningDocumentNode;
		}
	}

	createAttributeNS (namespaceURI, name) {
		return this._documentNode.createAttributeNS(namespaceURI, name);
	}

	createElementNS (namespaceURI, name) {
		return this._documentNode.createElementNS(namespaceURI, name);
	}

	createComment (contents) {
		return this._documentNode.createComment(contents);
	}

	createTextNode (contents) {
		return this._documentNode.createTextNode(contents);
	}

	createProcessingInstruction (target, data) {
		return this._documentNode.createProcessingInstruction(target, data);
	}
}
