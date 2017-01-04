import UntypedAtomicValue from './UntypedAtomicValue';
import StringValue from './StringValue';

/**
 * @constructor
 * @extends {Node}
 * @param  {Element}  element
 * @param  {string}   attributeName
 * @param  {string}   attributeValue
 */
function AttributeNode (element, attributeName, attributeValue) {
    this.value = attributeValue;
    this.nodeName = attributeName;
    this._element = element;

    this.nodeType = this.ATTRIBUTE_NODE;
}

/**
 * @const
 */
AttributeNode.prototype.ELEMENT_NODE = AttributeNode.ELEMENT_NODE = 1;

/**
 * @const
 */
AttributeNode.prototype.ATTRIBUTE_NODE = AttributeNode.ATTRIBUTE_NODE = 2;

/**
 * @const
 */
AttributeNode.prototype.TEXT_NODE = AttributeNode.TEXT_NODE = 3;

/**
 * @const
 */
AttributeNode.prototype.CDATA_SECTION_NODE = AttributeNode.CDATA_SECTION_NODE = 4;

/**
 * @const
 */
AttributeNode.prototype.ENTITY_REFERENCE_NODE = AttributeNode.ENTITY_REFERENCE_NODE = 5;

/**
 * @const
 */
AttributeNode.prototype.ENTITY_NODE = AttributeNode.ENTITY_NODE = 6;

/**
 * @const
 */
AttributeNode.prototype.PROCESSING_INSTRUCTION_NODE = AttributeNode.PROCESSING_INSTRUCTION_NODE = 7;

/**
 * @const
 */
AttributeNode.prototype.COMMENT_NODE = AttributeNode.COMMENT_NODE = 8;

/**
 * @const
 */
AttributeNode.prototype.DOCUMENT_NODE = AttributeNode.DOCUMENT_NODE = 9;

/**
 * @const
 */
AttributeNode.prototype.DOCUMENT_TYPE_NODE = AttributeNode.DOCUMENT_TYPE_NODE = 10;

/**
 * @const
 */
AttributeNode.prototype.DOCUMENT_FRAGMENT_NODE = AttributeNode.DOCUMENT_FRAGMENT_NODE = 11;

/**
 * @const
 */
AttributeNode.prototype.NOTATION_NODE = AttributeNode.NOTATION_NODE = 12;

AttributeNode.prototype.getParentNode = function () {
    return this._element;
};

AttributeNode.prototype.atomize = function () {
    // TODO: Mix in types
    return new UntypedAtomicValue(this.value);
};

AttributeNode.prototype.getStringValue = function () {
    return new StringValue(this.value);
};

export default AttributeNode;
