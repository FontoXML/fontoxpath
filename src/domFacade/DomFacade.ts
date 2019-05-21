import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES
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
		bucket: string | null
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

	public getChildNodes(node: ConcreteParentNode, bucket: string | null): ConcreteChildNode[] {
		return this._domFacade['getChildNodes'](node, bucket) as ConcreteChildNode[];
	}

	public getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.value;
		}

		return this._domFacade['getData'](node) || '';
	}

	public getFirstChild(node: ConcreteParentNode, bucket: string | null): ConcreteChildNode {
		return this._domFacade['getFirstChild'](node, bucket) as ConcreteChildNode;
	}

	public getLastChild(node: ConcreteParentNode, bucket: string | null): ConcreteChildNode {
		return this._domFacade['getLastChild'](node, bucket) as ConcreteChildNode;
	}

	public getNextSibling(node: ConcreteChildNode, bucket: string | null): ConcreteChildNode {
		return this._domFacade['getNextSibling'](node, bucket) as ConcreteChildNode;
	}

	public getParentNode(node: ConcreteChildNode, bucket: string | null): ConcreteParentNode {
		return this._domFacade['getParentNode'](node, bucket) as ConcreteParentNode;
	}

	public getPreviousSibling(node: ConcreteChildNode, bucket: string | null): ConcreteChildNode {
		return this._domFacade['getPreviousSibling'](node, bucket) as ConcreteChildNode;
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
