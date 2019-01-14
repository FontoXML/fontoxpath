import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES
} from './ConcreteNode';
import ExternalDomFacade from './ExternalDomFacade';
import IDomFacade from './IDomFacade';
import IWrappingDomFacade from './IWrappingDomFacade';

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 */
class DomFacade implements IWrappingDomFacade {
	public orderOfDetachedNodes: ConcreteNode[];

	constructor(private readonly _domFacade: ExternalDomFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 */
		this.orderOfDetachedNodes = [];
	}

	public getAllAttributes(node: ConcreteElementNode): ConcreteAttributeNode[] {
		return this._domFacade['getAllAttributes'](node);
	}

	public getAttribute(node: ConcreteElementNode, attributeName: string): string {
		const value = this._domFacade['getAttribute'](node, attributeName);
		if (!value) {
			return null;
		}
		return value;
	}

	public getChildNodes(node: ConcreteParentNode): ConcreteChildNode[] {
		const childNodes = [];

		for (
			let childNode = this.getFirstChild(node);
			childNode;
			childNode = this.getNextSibling(childNode)
		) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	public getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.value;
		}

		return this._domFacade['getData'](node) || '';
	}

	public getFirstChild(node: ConcreteParentNode): ConcreteChildNode {
		return this._domFacade['getFirstChild'](node);
	}

	public getLastChild(node: ConcreteParentNode): ConcreteChildNode {
		return this._domFacade['getLastChild'](node);
	}

	public getNextSibling(node: ConcreteChildNode): ConcreteChildNode {
		return this._domFacade['getNextSibling'](node);
	}

	public getParentNode(node: ConcreteElementNode): ConcreteParentNode;
	public getParentNode(node: ConcreteNode): ConcreteParentNode {
		return this._domFacade['getParentNode'](node);
	}

	public getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode {
		return this._domFacade['getPreviousSibling'](node);
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
