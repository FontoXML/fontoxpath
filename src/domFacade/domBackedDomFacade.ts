import {
	ConcreteNode,
	ConcreteElementNode,
	ConcreteParentNode,
	ConcreteChildNode,
	NODE_TYPES,
	ConcreteAttributeNode
} from './ConcreteNode';
import IWrappingDomFacade from './IWrappingDomFacade';

class DomBackedDomFacade implements IWrappingDomFacade {
	orderOfDetachedNodes: ConcreteNode[];
	constructor() {
		this.orderOfDetachedNodes = [];
	}
	unwrap() {
		return this;
	}

	getParentNode(node: ConcreteElementNode): ConcreteParentNode;
	getParentNode(node: ConcreteNode): ConcreteParentNode {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.ownerElement;
		}
		return node['parentNode'] as ConcreteParentNode;
	}

	getFirstChild(node: ConcreteParentNode): ConcreteChildNode {
		return node['firstChild'] as ConcreteChildNode;
	}

	getLastChild(node: ConcreteParentNode): ConcreteChildNode {
		return node['lastChild'] as ConcreteChildNode;
	}

	getNextSibling(node: ConcreteChildNode): ConcreteChildNode {
		return node['nextSibling'] as ConcreteChildNode;
	}

	getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode {
		return node['previousSibling'] as ConcreteChildNode;
	}

	getChildNodes(node: ConcreteParentNode): ConcreteChildNode[] {
		const childNodes = [];

		for (
			let childNode: ConcreteChildNode = this.getFirstChild(node);
			childNode;
			childNode = this.getNextSibling(childNode) as ConcreteChildNode
		) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	getAttribute(node: ConcreteElementNode | ConcreteAttributeNode, attributeName: string): string {
		if (node['nodeType'] === 2) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}

	getAllAttributes(node: ConcreteElementNode | ConcreteAttributeNode): ConcreteAttributeNode[] {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return [];
		}

		return Array.from(node['attributes']);
	}

	getData(node: Attr | CharacterData) {
		return node['data'] || '';
	}

	getRelatedNodes(node, callback) {
		return callback(node, this);
	}
}

export default new DomBackedDomFacade();
