import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode
} from './ConcreteNode';

import IDomFacade from './IDomFacade';

export default class ExternalDomFacade implements IDomFacade {
	public ['getAllAttributes'](node: ConcreteElementNode): ConcreteAttributeNode[] {
		return Array.from(node['attributes']);
	}
	public ['getAttribute'](node: ConcreteElementNode, attributeName: string): string {
		return node.getAttribute(attributeName);
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
		return node['parentNode'] as ConcreteParentNode;
	}
	public ['getPreviousSibling'](node: ConcreteChildNode): ConcreteChildNode {
		return node['previousSibling'] as ConcreteChildNode;
	}
}
