export default function getBucketsForNode (node) {
	var buckets = [];

	buckets.push('type-' + node.nodeType);

	if (node.nodeType === node.ELEMENT_NODE) {
		buckets.push('name-' + node.localName);
	}

	return buckets;
}
