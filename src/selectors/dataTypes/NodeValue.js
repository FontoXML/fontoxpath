import StringValue from './StringValue';
import AttributeNode from './AttributeNode';
import Item from './Item';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';
import UntypedAtomicValue from './UntypedAtomicValue';

import nodeValueCache from './nodeValueCache';

let currentNodeId = 1;
/**
 * @constructor
 * @extends {Item}
 * @param  {!Node}       node
 */
function NodeValue (node) {
	if (nodeValueCache.has(node)) {
		return nodeValueCache.get(node);
	}
    nodeValueCache.set(node, this);

    Item.call(this, node);

	this._id = (currentNodeId++) + '';

    this.nodeType = node.nodeType;
	this.target = null;

    switch (node.nodeType) {
        case this.value.ATTRIBUTE_NODE:
            this.nodeName = this.value.nodeName;
            break;
        case this.value.ELEMENT_NODE:
            // element
            this.nodeName = this.value.nodeName;
            break;
        case this.value.PROCESSING_INSTRUCTION_NODE:
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

NodeValue.prototype = Object.create(Item.prototype);

NodeValue.primitiveTypeName = NodeValue.prototype.primitiveTypeName = 'node()';

NodeValue.prototype.instanceOfType = function (simpleTypeName) {
    switch (simpleTypeName) {
        case 'node()':
            return true;
        case 'attribute()':
            return this.value.nodeType === this.value.ATTRIBUTE_NODE;
        case 'element()':
            return this.value.nodeType === this.value.ELEMENT_NODE;
        case 'text()':
            return this.value.nodeType === this.value.TEXT_NODE ||
				this.value.nodeType === 4; // CDATA nodes are text too
        case 'processing-instruction()':
            return this.value.nodeType === this.value.PROCESSING_INSTRUCTION_NODE;
        case 'comment()':
            return this.value.nodeType === this.value.COMMENT_NODE;
        case 'document()':
            return this.value.nodeType === this.value.DOCUMENT_NODE;

        default:
            return Item.prototype.instanceOfType.call(this, simpleTypeName);
    }
};

/**
* @return {string}
*/
NodeValue.prototype.toString = function () {
	return `(node ${this._id})`;
};


/**
 * @return {!AnyAtomicTypeValue}
 */
NodeValue.prototype.atomize = function (dynamicContext) {
    // TODO: Mix in types, by default get string value
    if (this.value instanceof AttributeNode) {
        return this.value.atomize(dynamicContext);
    }

	// Text nodes and documents should return their text, as untyped atomic
    if (this.instanceOfType('text()')) {
        return new UntypedAtomicValue(dynamicContext.domFacade.getData(this.value));
    }
	// comments and PIs are string
	if (this.instanceOfType('comment()') || this.instanceOfType('processing-instruction()')) {
		return new StringValue(dynamicContext.domFacade.getData(this.value));
	}

	// This is an element or a document node. Because we do not know the specific type of this element.
	// Documents should always be an untypedAtomic, of elements, we do not know the type, so they are untypedAtomic too
    var allTextNodes = (function getTextNodes (node) {
		if (node.nodeType === node.TEXT_NODE || node.nodeType === 4) {
			return [node];
		}
		return dynamicContext.domFacade.getChildNodes(node)
			.reduce(function (textNodes, childNode) {
				Array.prototype.push.apply(textNodes, getTextNodes(childNode));
				return textNodes;
			}, []);
	})(this.value);

    return new UntypedAtomicValue(allTextNodes.map(function (textNode) {
        return dynamicContext.domFacade.getData(textNode);
    }.bind(this)).join(''));
};

NodeValue.prototype.getStringValue = function (dynamicContext) {
    if (this.value instanceof AttributeNode) {
        return this.value.getStringValue(dynamicContext);
    }

    return this.atomize(dynamicContext);
};

NodeValue.prototype.getEffectiveBooleanValue = () => true;
export default NodeValue;
