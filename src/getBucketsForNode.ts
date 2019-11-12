import { NODE_TYPES } from './domFacade/ConcreteNode';
import { Attr, Element, Node } from './types/Types';

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
export default function getBucketsForNode(node: Node): string[] {
	const buckets = [];

	buckets.push('type-' + node.nodeType);

	if (node.nodeType === NODE_TYPES.ATTRIBUTE_NODE || node.nodeType === NODE_TYPES.ELEMENT_NODE) {
		buckets.push('name-' + (node as Attr | Element).localName);
	}

	return buckets;
}
