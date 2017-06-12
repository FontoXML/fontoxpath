import nodeValueCache from './nodeValueCache';

function getNodeSubType (node) {
	switch (node.nodeType) {
		case 2:
			return 'attribute()';
		case 1:
			return 'element()';
		case 3:
		case 4: // CDATA nodes are text too
			return 'text()';
		case 7:
			return 'processing-instruction()';
		case 8:
			return 'comment()';
		case 9:
			return 'document()';
		default:
			return 'node()';
	}
}

export default function createFromNode (node) {
	if (nodeValueCache.has(node)) {
		return nodeValueCache.get(node);
	}
	const nodeValue = { type: getNodeSubType(node), value: node };
	nodeValueCache.set(node, nodeValue);
	return nodeValue;
}
