import Value from '../expressions/dataTypes/Value';
import IDomFacade from './IDomFacade';

function isAttributeNode(node: Node): boolean {
	return node.nodeType === 2;
}

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 */
class DomFacade implements IDomFacade {
	orderOfDetachedNodes: Array<Value>;
	private _domFacade: object;

	constructor (domFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 */
		this.orderOfDetachedNodes = [];

		this._domFacade = domFacade;
	}

	getParentNode(node: Node): Node | null {
		return this._domFacade['getParentNode'](node);
	}

	getFirstChild(node: Node): Node | null {
		return this._domFacade['getFirstChild'](node);
	}

	getLastChild(node: Node): Node | null {
		return this._domFacade['getLastChild'](node);
	}

	getNextSibling(node: Node): Node | null {
		return this._domFacade['getNextSibling'](node);
	}

	getPreviousSibling(node: Node): Node | null {
		return this._domFacade['getPreviousSibling'](node);
	}

	getChildNodes(node: Node): Array<Node> {
		const childNodes = [];

		for (let childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	getAttribute (node, attributeName) {
		const value = this._domFacade['getAttribute'](node, attributeName);
		if (!value) {
			return null;
		}
		return value;
	}

	getAllAttributes (node) {
		return this._domFacade['getAllAttributes'](node);
	}

	getData (node) {
		if (isAttributeNode(node)) {
			return (node as Attr).value;
		}

		return this._domFacade['getData'](node) || '';
	}

	unwrap () {
		return this._domFacade;
	}

	// Can be used to create an extra frame when tracking dependencies
	getRelatedNodes (node, callback) {
		return callback(node, this);
	}

}
export default DomFacade;
