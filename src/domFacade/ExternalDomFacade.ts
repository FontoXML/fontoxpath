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

export default class ExternalDomFacade implements IDomFacade {
	public ['getAllAttributes'](node: ConcreteElementNode): ConcreteAttributeNode[] {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return [];
		}
		return Array.from(node['attributes']);
	}
	public ['getAttribute'](node: ConcreteNode, attributeName: string): string {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}
	public ['getChildNodes'](node: ConcreteParentNode): ConcreteChildNode[] {
		return Array.from(node['childNodes']) as ConcreteChildNode[];
	}
	public ['getData'](node: ConcreteAttributeNode | ConcreteCharacterDataNode): string {
		return node['data'];
	}
	public ['getFirstChild'](node: ConcreteParentNode): ConcreteChildNode {
		return node['firstChild'] as ConcreteChildNode;
	}
	public ['getLastChild'](node: ConcreteParentNode): ConcreteChildNode {
		return node['lastChild'] as ConcreteChildNode;
	}
	public ['getNextSibling'](node: ConcreteChildNode): ConcreteChildNode {
		return node['nextSibling'] as ConcreteChildNode;
	}
	public ['getParentNode'](node: ConcreteNode): ConcreteParentNode {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node['ownerElement'];
		}
		return node['parentNode'] as ConcreteParentNode;
	}
	public ['getPreviousSibling'](node: ConcreteChildNode): ConcreteChildNode {
		return node['previousSibling'] as ConcreteChildNode;
	}
}
