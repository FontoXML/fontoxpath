import StringValue from './StringValue';
import AttributeNode from './AttributeNode';
import Item from './Item';
import DomFacade from '../../DomFacade';
import AnyAtomicTypeValue from './AnyAtomicTypeValue';

// This should work for maximal reuse of instances:
// NodeValue has a strong ref to a Node, but when it's only referenced by this weakmap, it should be eligible for GC
// When it is collected, the Node may be collected too
const nodeValueByNode = new WeakMap();

/**
 * @constructor
 * @extends {Item}
 * @param  {!DomFacade}  domFacade
 * @param  {!Node}       node
 */
function NodeValue (domFacade, node) {
    if (nodeValueByNode.has(node)) {
        return nodeValueByNode.get(node);
    }
    nodeValueByNode.set(node, this);

    Item.call(this, node);

    this._domFacade = domFacade;
    this.nodeType = node.nodeType;
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
            this.nodeName = this.value.target;
            break;
        default:
            // All other nodes have no name
            this.nodeName = null;
    }
    this.target = node.target;
    return this;
}

NodeValue.prototype = Object.create(Item.prototype);

NodeValue.prototype.instanceOfType = function (simpleTypeName) {
    switch (simpleTypeName) {
        case 'node()':
            return true;
        case 'attribute()':
            return this.value.nodeType === this.value.ATTRIBUTE_NODE;
        case 'element()':
            return this.value.nodeType === this.value.ELEMENT_NODE;
        case 'text()':
            return this.value.nodeType === this.value.TEXT_NODE;
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
 * @return {!AnyAtomicTypeValue}
 */
NodeValue.prototype.atomize = function () {
    // TODO: Mix in types, by default get string value
    if (this.value instanceof AttributeNode) {
        return this.value.atomize();
    }

    if (this.instanceOfType('text()')) {
        return new StringValue(this._domFacade.getData(this.value));
    }
    var domFacade = this._domFacade;
    var allTextNodes = (function getTextNodes (node) {
        if (node.nodeType === node.TEXT_NODE) {
            return [node];
        }
        return domFacade.getChildNodes(node)
            .reduce(function (textNodes, childNode) {
                Array.prototype.push.apply(textNodes, getTextNodes(childNode));
                return textNodes;
            }, []);
    })(this.value);

    return new StringValue(allTextNodes.map(function (textNode) {
        return this._domFacade.getData(textNode);
    }.bind(this)).join(''));
};

NodeValue.prototype.getStringValue = function () {
    if (this.value instanceof AttributeNode) {
        return this.value.getStringValue();
    }

    return this.atomize();
};

export default NodeValue;
