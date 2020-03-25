import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
} from './ConcreteNode';
import IDomFacade from './IDomFacade';
import IWrappingDomFacade from './IWrappingDomFacade';

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 */
class DomFacade implements IWrappingDomFacade {
	public orderOfDetachedNodes: ConcreteNode[];

	constructor(private readonly _domFacade: IDomFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 */
		this.orderOfDetachedNodes = [];
	}

	public getAllAttributes(
		node: ConcreteElementNode,
		bucket: string | null = null
	): ConcreteAttributeNode[] {
		return this._domFacade['getAllAttributes'](node, bucket);
	}

	public getAttribute(node: ConcreteElementNode, attributeName: string): string {
		const value = this._domFacade['getAttribute'](node, attributeName);
		if (!value) {
			return null;
		}
		return value;
	}

	public getChildNodes(
		node: ConcreteParentNode,
		bucket: string | null = null
	): ConcreteChildNode[] {
		const childNodes = this._domFacade['getChildNodes'](node, bucket);
		if (node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
			return childNodes as ConcreteChildNode[];
		}
		return childNodes.filter(
			(childNode) => childNode.nodeType !== NODE_TYPES.DOCUMENT_TYPE_NODE
		) as ConcreteChildNode[];
	}

	public getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.value;
		}

		return this._domFacade['getData'](node) || '';
	}

	public getFirstChild(
		node: ConcreteParentNode,
		bucket: string | null = null
	): ConcreteChildNode {
		const firstChild = this._domFacade['getFirstChild'](node, bucket);
		if (!firstChild) {
			return null;
		}
		if (firstChild.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
			return this.getNextSibling(firstChild as any);
		}
		return firstChild as ConcreteChildNode;
	}

	public getLastChild(node: ConcreteParentNode, bucket: string | null = null): ConcreteChildNode {
		const lastChild = this._domFacade['getLastChild'](node, bucket);
		if (!lastChild) {
			return null;
		}
		if (lastChild.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
			return this.getPreviousSibling(lastChild as any);
		}
		return lastChild as ConcreteChildNode;
	}

	public getNextSibling(
		node: ConcreteChildNode,
		bucket: string | null = null
	): ConcreteChildNode {
		for (
			let node2 = this._domFacade['getNextSibling'](node, bucket);
			node2;
			node2 = this._domFacade['getNextSibling'](node2, bucket)
		) {
			if (node2.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
				continue;
			}
			return node2 as ConcreteChildNode;
		}
		return null;
	}

	public getParentNode(
		node: ConcreteChildNode,
		bucket: string | null = null
	): ConcreteParentNode {
		return this._domFacade['getParentNode'](node, bucket) as ConcreteParentNode;
	}

	public getPreviousSibling(
		node: ConcreteChildNode,
		bucket: string | null = null
	): ConcreteChildNode {
		for (
			let node2 = this._domFacade['getPreviousSibling'](node, bucket);
			node2;
			node2 = this._domFacade['getPreviousSibling'](node2, bucket)
		) {
			if (node2.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
				continue;
			}
			return node2 as ConcreteChildNode;
		}
		return null;
	}

	// Can be used to create an extra frame when tracking dependencies
	public getRelatedNodes(node, callback) {
		return callback(node, this);
	}

	public unwrap(): IDomFacade {
		return this._domFacade;
	}
}
export default DomFacade;
