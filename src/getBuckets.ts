import { AttributeNodePointer, ElementNodePointer, NodePointer } from './domClone/Pointer';
import { NODE_TYPES } from './domFacade/ConcreteNode';
import DomFacade from './domFacade/DomFacade';
import { Attr, Element, Node } from './types/Types';

function createBuckets(nodeType: NODE_TYPES, localName?: string): string[] {
	const buckets = [];

	buckets.push('type-' + nodeType);

	if (localName) {
		buckets.push('name-' + localName);
	}

	return buckets;
}

export function getBucketsForPointer(pointer: NodePointer, domFacade: DomFacade): string[] {
	const nodeType = domFacade.getNodeType(pointer);
	let localName;
	if (nodeType === NODE_TYPES.ATTRIBUTE_NODE || nodeType === NODE_TYPES.ELEMENT_NODE) {
		localName = domFacade.getLocalName(pointer as AttributeNodePointer | ElementNodePointer);
	}

	return createBuckets(nodeType, localName);
}

/**
 * Get the buckets that apply to a given node.
 *
 * Buckets can be used to pre-filter XPath expressions to exclude those that will never match the given node.
 *
 * The bucket for a selector can be retrieved using {@link getBucketForSelector}.
 *
 * @public
 *
 * @param node - The node which buckets should be retrieved
 */
export function getBucketsForNode(node: Node): string[] {
	const nodeType = node.nodeType;
	let localName;
	if (nodeType === NODE_TYPES.ATTRIBUTE_NODE || nodeType === NODE_TYPES.ELEMENT_NODE) {
		localName = (node as Attr | Element).localName;
	}

	return createBuckets(nodeType, localName);
}
