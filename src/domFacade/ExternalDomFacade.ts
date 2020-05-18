import { Attr, CharacterData, Node } from '../types/Types';
import { NODE_TYPES } from './ConcreteNode';
import IDomFacade from './IDomFacade';
import { getBucketsForNode } from '../getBuckets';

export default class ExternalDomFacade implements IDomFacade {
	public ['getAllAttributes'](node: Node, bucket: string | null = null): Attr[] {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return [];
		}
		const attrs = Array.from(node['attributes']) as Attr[];
		if (bucket === null) {
			return attrs;
		}
		return attrs.filter((attr) => getBucketsForNode(attr).includes(bucket));
	}
	public ['getAttribute'](node: Node, attributeName: string): string {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}
	public ['getChildNodes'](node: Node, bucket: string | null = null): Node[] {
		const childNodes = Array.from(node['childNodes'] as Node[]);

		if (bucket === null) {
			return childNodes;
		}

		return childNodes.filter((child) => getBucketsForNode(child).includes(bucket));
	}
	public ['getData'](node: Attr | CharacterData): string {
		return node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE ? node['value'] : node['data'];
	}
	public ['getFirstChild'](node: Node, bucket: string | null = null): Node | null {
		for (let child = node['firstChild'] as Node; child; child = child['nextSibling'] as Node) {
			if (bucket === null || getBucketsForNode(child).includes(bucket)) {
				return child;
			}
		}

		return null;
	}
	public ['getLastChild'](node: Node, bucket: string | null = null): Node | null {
		for (
			let child = node['lastChild'] as Node;
			child;
			child = child['previousSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(child).includes(bucket)) {
				return child;
			}
		}

		return null;
	}
	public ['getNextSibling'](node: Node, bucket: string | null = null): Node | null {
		for (
			let sibling = node['nextSibling'] as Node;
			sibling;
			sibling = sibling['nextSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(sibling).includes(bucket)) {
				return sibling;
			}
		}

		return null;
	}
	public ['getParentNode'](node: Node, bucket: string | null = null): Node {
		const parentNode =
			node['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE
				? node['ownerElement']
				: (node['parentNode'] as Node);

		if (bucket === null || getBucketsForNode(parentNode).includes(bucket)) {
			return parentNode;
		}
		return null;
	}
	public ['getPreviousSibling'](node: Node, bucket: string | null = null): Node | null {
		for (
			let sibling = node['previousSibling'] as Node;
			sibling;
			sibling = sibling['previousSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(sibling).includes(bucket)) {
				return sibling;
			}
		}

		return null;
	}
}
