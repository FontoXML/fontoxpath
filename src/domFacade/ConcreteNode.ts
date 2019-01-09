export const enum NODE_TYPES {
	ELEMENT_NODE = 1,
	ATTRIBUTE_NODE = 2,
	TEXT_NODE = 3,
	CDATA_SECION_NODE = 4,
	PROCESSING_INSTRUCTION_NODE = 7,
	COMMENT_NODE = 8,
	DOCUMENT_NODE = 9,
	DOCUMENT_TYPE_NODE = 10,
	DOCUMENT_FRAGMENT_NODE = 11,
}

export interface ConcreteTextNode extends CharacterData {
	nodeType: NODE_TYPES.TEXT_NODE;
}

export type ConcreteParentNode = (ConcreteElementNode|ConcreteDocumentNode);

export type ConcreteChildNode = (ConcreteElementNode|ConcreteTextNode|ConcreteProcessingInstructionNode|ConcreteCommentNode);

export interface ConcreteElementNode extends Element {
	nodeType: NODE_TYPES.ELEMENT_NODE;
}

export type ConcreteCharacterDataNode = (ConcreteTextNode|ConcreteProcessingInstructionNode|ConcreteCommentNode);

export interface ConcreteProcessingInstructionNode extends CharacterData {
	nodeType: NODE_TYPES.PROCESSING_INSTRUCTION_NODE;
}

export interface ConcreteCommentNode extends CharacterData {
	nodeType: NODE_TYPES.COMMENT_NODE;
}

export interface ConcreteAttributeNode extends Attr {
	nodeType: NODE_TYPES.ATTRIBUTE_NODE;
}

export interface ConcreteDocumentNode extends Document {
	nodeType: NODE_TYPES.DOCUMENT_NODE;
}

type ConcreteNode = (
	ConcreteChildNode |
	ConcreteParentNode |
	ConcreteAttributeNode);

export default ConcreteNode;
