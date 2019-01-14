import {
	ConcreteAttributeNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES
} from './ConcreteNode';
import IWrappingDomFacade from './IWrappingDomFacade';

class DomBackedDomFacade implements IWrappingDomFacade {
	public orderOfDetachedNodes: ConcreteNode[];
	constructor() {
		this.orderOfDetachedNodes = [];
	}

	public getAllAttributes(
		node: ConcreteElementNode | ConcreteAttributeNode
	): ConcreteAttributeNode[] {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return [];
		}

		return Array.from(node['attributes']);
	}

	public getAttribute(
		node: ConcreteElementNode | ConcreteAttributeNode,
		attributeName: string
	): string {
		if (node['nodeType'] === 2) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}

	public getChildNodes(node: ConcreteParentNode): ConcreteChildNode[] {
		const childNodes = [];

		for (
			let childNode: ConcreteChildNode = this.getFirstChild(node);
			childNode;
			childNode = this.getNextSibling(childNode)
		) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	public getData(node: Attr | CharacterData) {
		return node['data'] || '';
	}

	public getFirstChild(node: ConcreteParentNode): ConcreteChildNode {
		return node['firstChild'] as ConcreteChildNode;
	}

	public getLastChild(node: ConcreteParentNode): ConcreteChildNode {
		return node['lastChild'] as ConcreteChildNode;
	}

	public getNextSibling(node: ConcreteChildNode): ConcreteChildNode {
		return node['nextSibling'] as ConcreteChildNode;
	}

	public getParentNode(node: ConcreteElementNode): ConcreteParentNode;
	public getParentNode(node: ConcreteNode): ConcreteParentNode {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node.ownerElement;
		}
		return node['parentNode'] as ConcreteParentNode;
	}

	public getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode {
		return node['previousSibling'] as ConcreteChildNode;
	}

	public getRelatedNodes(node, callback) {
		return callback(node, this);
	}
	public unwrap() {
		return this;
	}
}

export default new DomBackedDomFacade();
