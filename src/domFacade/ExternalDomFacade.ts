import { Attr, CharacterData, Node } from '../types/Types';
import { NODE_TYPES } from './ConcreteNode';
import IDomFacade from './IDomFacade';

export default class ExternalDomFacade implements IDomFacade {
	public ['getAllAttributes'](node: Node): Attr[] {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return [];
		}
		return Array.from(node['attributes']);
	}
	public ['getAttribute'](node: Node, attributeName: string): string {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}
	public ['getChildNodes'](node: Node): Node[] {
		return Array.from(node['childNodes']);
	}
	public ['getData'](node: Attr | CharacterData): string {
		return node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE ? node['value'] : node['data'];
	}
	public ['getFirstChild'](node: Node): Node {
		return node['firstChild'] as Node;
	}
	public ['getLastChild'](node: Node): Node {
		return node['lastChild'] as Node;
	}
	public ['getNextSibling'](node: Node): Node {
		return node['nextSibling'];
	}
	public ['getParentNode'](node: Node): Node {
		if (node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE) {
			return node['ownerElement'];
		}
		return node['parentNode'] as Node;
	}
	public ['getPreviousSibling'](node: Node): Node {
		return node['previousSibling'];
	}
}
