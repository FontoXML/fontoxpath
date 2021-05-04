import {
	Attr,
	CDATASection,
	Comment,
	Document,
	Element,
	ProcessingInstruction,
	Text,
} from '../types/Types';

export const enum NODE_TYPES {
	ELEMENT_NODE = 1,
	ATTRIBUTE_NODE = 2,
	TEXT_NODE = 3,
	CDATA_SECTION_NODE = 4,
	PROCESSING_INSTRUCTION_NODE = 7,
	COMMENT_NODE = 8,
	DOCUMENT_NODE = 9,
	DOCUMENT_TYPE_NODE = 10,
	DOCUMENT_FRAGMENT_NODE = 11,
}

// Concretes
export type ConcreteTextNode = Text & { nodeType: NODE_TYPES.TEXT_NODE };
export type ConcreteElementNode = Element & { nodeType: NODE_TYPES.ELEMENT_NODE };
export type ConcreteCommentNode = Comment & { nodeType: NODE_TYPES.COMMENT_NODE };
export type ConcreteCDATASectionNode = CDATASection & { nodeType: NODE_TYPES.CDATA_SECTION_NODE };
export type ConcreteDocumentTypeNode = DocumentType & { nodeType: NODE_TYPES.DOCUMENT_TYPE_NODE };
export type ConcreteAttributeNode = Attr & { nodeType: NODE_TYPES.ATTRIBUTE_NODE };
export type ConcreteDocumentNode = Document & { nodeType: NODE_TYPES.DOCUMENT_NODE };
export type ConcreteProcessingInstructionNode = ProcessingInstruction & {
	nodeType: NODE_TYPES.PROCESSING_INSTRUCTION_NODE;
};
export type ConcreteParentNode = ConcreteElementNode | ConcreteDocumentNode;
export type ConcreteChildNode =
	| ConcreteElementNode
	| ConcreteTextNode
	| ConcreteProcessingInstructionNode
	| ConcreteCommentNode
	| ConcreteCDATASectionNode;
export type ConcreteCharacterDataNode =
	| ConcreteTextNode
	| ConcreteCDATASectionNode
	| ConcreteProcessingInstructionNode
	| ConcreteCommentNode;
export type ConcreteNode =
	| ConcreteChildNode
	| ConcreteParentNode
	| ConcreteAttributeNode
	| ConcreteDocumentTypeNode;
