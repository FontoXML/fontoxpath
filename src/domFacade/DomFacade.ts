import {
	ConcreteNode,
	NODE_TYPES,
	ConcreteElementNode,
	ConcreteParentNode,
	ConcreteChildNode,
	ConcreteAttributeNode,
	ConcreteCharacterDataNode
} from './ConcreteNode';
import IWrappingDomFacade from './IWrappingDomFacade';
import IDomFacade from './IDomFacade';
import IExternalDomFacade from './IExternalDomFacade';

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 */
class DomFacade implements IWrappingDomFacade {
	orderOfDetachedNodes: ConcreteNode[];

	constructor(private readonly _domFacade: IExternalDomFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 */
		this.orderOfDetachedNodes = [];
	}

	getParentNode(node: ConcreteElementNode): ConcreteParentNode;
	getParentNode(node: ConcreteNode): ConcreteParentNode {
		return this._domFacade['getParentNode'](node);
	}

	getFirstChild(node: ConcreteParentNode): ConcreteChildNode {
		return this._domFacade['getFirstChild'](node);
	}

	getLastChild(node: ConcreteParentNode): ConcreteChildNode {
		return this._domFacade['getLastChild'](node);
	}

	getNextSibling(node: ConcreteChildNode): ConcreteChildNode {
		return this._domFacade['getNextSibling'](node);
	}

	getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode {
		return this._domFacade['getPreviousSibling'](node);
	}

	getChildNodes(node: ConcreteParentNode): ConcreteChildNode[] {
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

	getAttribute(node: ConcreteElementNode, attributeName: string): string {
		const value = this._domFacade['getAttribute'](node, attributeName);
		if (!value) {
			return null;
		}
		return value;
	}

	getAllAttributes(node: ConcreteElementNode): ConcreteAttributeNode[] {
		return this._domFacade['getAllAttributes'](node);
	}

	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.value;
		}

		return this._domFacade['getData'](node) || '';
	}

	unwrap(): IDomFacade {
		return this._domFacade;
	}

	// Can be used to create an extra frame when tracking dependencies
	getRelatedNodes(node, callback) {
		return callback(node, this);
	}
}
export default DomFacade;
