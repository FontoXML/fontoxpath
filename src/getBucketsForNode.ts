import { NODE_TYPES } from './domFacade/ConcreteNode';

/**
 * Get the buckets that apply to a given node.
 *
 * Buckets can be used to pre-filter XPath expressions to exclude those that will never match the given node.
 *
 * The bucket for a selector can be retrieved using {@link getBucketForSelector}.
 *
 * @param node - The node which buckets should be retrieved
 */
export default function getBucketsForNode(
	// TODO: Use the internal Node type for this parameter when we create one
	node:
		| {
				nodeType: NODE_TYPES;
		  }
		| { localName: string; nodeType: NODE_TYPES.ELEMENT_NODE | NODE_TYPES.ATTRIBUTE_NODE }
): string[] {
	const buckets = [];

	buckets.push('type-' + node.nodeType);

	if (node.nodeType === NODE_TYPES.ELEMENT_NODE || node.nodeType === NODE_TYPES.ATTRIBUTE_NODE) {
		buckets.push('name-' + (node as Element).localName);
	}

	return buckets;
}
