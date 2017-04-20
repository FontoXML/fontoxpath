import atomize from './atomize';
import AttributeNode from './AttributeNode';
import nodeValueCache from './nodeValueCache';

let currentNodeId = 1;

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
/**
 * @extends {./Value}
 */
class NodeValue {
	/**
	 * @private
	 * @param  {!Node}  node
	 */
	constructor (node) {
		this.type = getNodeSubType(node);
		this._id = (currentNodeId++) + '';

		this.value = node;
		this.nodeType = node.nodeType;
		this.target = null;

		switch (node.nodeType) {
			case 2:
				this.nodeName = this.value.nodeName;
				break;
			case 1:
				// element
				this.nodeName = this.value.nodeName;
				break;
			case 7:
				// A processing instruction's target is its nodename (https://www.w3.org/TR/xpath-functions-31/#func-node-name)
				this.nodeName = (/** @type {ProcessingInstruction} */(this.value)).target;
				this.target = this.nodeName;

				break;
			default:
				// All other nodes have no name
				this.nodeName = null;
		}
		return this;
	}

	getStringValue (dynamicContext) {
		if (this.value instanceof AttributeNode) {
			return this.value.getStringValue(dynamicContext);
		}

		return atomize(this, dynamicContext);
	}
}

NodeValue.createFromNode = function (node) {
		if (nodeValueCache.has(node)) {
			return nodeValueCache.get(node);
		}
	const nodeValue = new NodeValue(node);
	nodeValueCache.set(node, nodeValue);
	return nodeValue;
};

export default NodeValue;
