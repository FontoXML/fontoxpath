import { getBucketsForNode } from '../getBuckets';
import { Attr, CharacterData, Node } from '../types/Types';
import { NODE_TYPES } from './ConcreteNode';
import IDomFacade from './IDomFacade';

export default class ExternalDomFacade implements IDomFacade {
	public ['getAllAttributes'](node: Node, bucket: string | null = null): Attr[] {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return [];
		}
		const attrs = Array.from((node as any)['attributes']) as unknown as Attr[];
		if (bucket === null) {
			return attrs;
		}
		return attrs.filter((attr) => getBucketsForNode(attr).includes(bucket));
	}
	public ['getAttribute'](node: Node, attributeName: string): string {
		if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return null;
		}
		return (node as any)['getAttribute'](attributeName);
	}
	public ['getChildNodes'](node: Node, bucket: string | null = null): Node[] {
		const childNodes = Array.from((node as any)['childNodes'] as Node[]);

		if (bucket === null) {
			return childNodes;
		}

		return childNodes.filter((child) => getBucketsForNode(child).includes(bucket));
	}
	public ['getData'](node: Attr | CharacterData): string {
		return (node as any)['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE
			? (node as any)['value']
			: (node as any)['data'];
	}
	public ['getFirstChild'](node: Node, bucket: string | null = null): Node | null {
		for (
			let child = (node as any)['firstChild'] as Node;
			child;
			child = (child as any)['nextSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(child).includes(bucket)) {
				return child;
			}
		}

		return null;
	}
	public ['getLastChild'](node: Node, bucket: string | null = null): Node | null {
		for (
			let child = (node as any)['lastChild'] as Node;
			child;
			child = (child as any)['previousSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(child).includes(bucket)) {
				return child;
			}
		}

		return null;
	}
	public ['getNextSibling'](node: Node, bucket: string | null = null): Node | null {
		for (
			let sibling = (node as any)['nextSibling'] as Node;
			sibling;
			sibling = (sibling as any)['nextSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(sibling).includes(bucket)) {
				return sibling;
			}
		}

		return null;
	}
	public ['getParentNode'](node: Node, bucket: string | null = null): Node | null {
		const parentNode =
			(node as any)['nodeType'] === NODE_TYPES.ATTRIBUTE_NODE
				? (node as any)['ownerElement']
				: ((node as any)['parentNode'] as Node);

		if (!parentNode) {
			return null;
		}

		if (bucket === null || getBucketsForNode(parentNode).includes(bucket)) {
			return parentNode;
		}
		return null;
	}
	public ['getPreviousSibling'](node: Node, bucket: string | null = null): Node | null {
		for (
			let sibling = (node as any)['previousSibling'] as Node;
			sibling;
			sibling = (sibling as any)['previousSibling'] as Node
		) {
			if (bucket === null || getBucketsForNode(sibling).includes(bucket)) {
				return sibling;
			}
		}

		return null;
	}
}
