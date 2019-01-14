export default function getBucketsForNode(node: Node): string[] {
	const buckets = [];

	buckets.push('type-' + node.nodeType);

	if (node.nodeType === node.ELEMENT_NODE || node.nodeType === node.ATTRIBUTE_NODE) {
		buckets.push('name-' + (node as Element).localName);
	}

	return buckets;
}
