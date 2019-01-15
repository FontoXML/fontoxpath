/**
 * Get the buckets that apply to a given node.
 *
 * Buckets can be used to pre-filter XPath expressions to exclude those that will never match the given node.
 *
 * The bucket for a selector can be retrieved using {@link getBucketForSelector}.
 *
 * @param node - The node which buckets should be retrieved
 */
export default function getBucketsForNode(node: Node): string[] {
	const buckets = [];

	buckets.push('type-' + node.nodeType);

	if (node.nodeType === node.ELEMENT_NODE || node.nodeType === node.ATTRIBUTE_NODE) {
		buckets.push('name-' + (node as Element).localName);
	}

	return buckets;
}
