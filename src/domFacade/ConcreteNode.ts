export enum NODE_TYPES {
	ELEMENT_NODE = 1,
	TEXT_NODE = 3,
	CDATA_SECION_NODE = 4,
	PROCESSING_INSTRUCTION_NODE = 7,
	COMMENT_NODE = 8,
	DOCUMENT_NODE = 9,
	DOCUMENT_TYPE_NODE = 10,
	DOCUMENT_FRAGMENT_NODE = 11,
	ATTRIBUTE_NODE = 2,
}

export interface ConcreteTextNode extends ConcreteCharacterDataNode {
	nodeType: NODE_TYPES.TEXT_NODE
}

export interface ConcreteParentNode extends ParentNode {
	nodeType: NODE_TYPES.ELEMENT_NODE | NODE_TYPES.DOCUMENT_NODE
}

export interface ConcreteChildNode extends ChildNode {
	nodeType: NODE_TYPES.ELEMENT_NODE | NODE_TYPES.TEXT_NODE | NODE_TYPES.PROCESSING_INSTRUCTION_NODE | NODE_TYPES.COMMENT_NODE
}

export interface ConcreteElementNode extends Element {
	nodeType: NODE_TYPES.ELEMENT_NODE
}

export interface ConcreteProcessingInstructionNode extends ConcreteCharacterDataNode {
	nodeType: NODE_TYPES.PROCESSING_INSTRUCTION_NODE
}

export interface ConcreteCommentNode extends ConcreteCharacterDataNode {
	nodeType: NODE_TYPES.COMMENT_NODE
}

export interface ConcreteAttributeNode extends Attr {
	nodeType: NODE_TYPES.ATTRIBUTE_NODE
}

export interface ConcreteDocumentNode extends Document {
	nodeType: NODE_TYPES.DOCUMENT_NODE
}

export interface ConcreteCharacterDataNode extends CharacterData {
	nodeType: NODE_TYPES.COMMENT_NODE | NODE_TYPES.TEXT_NODE | NODE_TYPES.PROCESSING_INSTRUCTION_NODE
}

type ConcreteNode = (
	ConcreteChildNode |
	ConcreteParentNode |
	ConcreteAttributeNode);

export default ConcreteNode;
