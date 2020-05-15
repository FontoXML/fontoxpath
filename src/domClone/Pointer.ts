import {
	ConcreteAttributeNode,
	ConcreteCDATASectionNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteCommentNode,
	ConcreteDocumentNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	ConcreteProcessingInstructionNode,
	ConcreteTextNode,
} from '../domFacade/ConcreteNode';

// TinyNodes
type Tiny = { isTinyNode: true };
export type TinyElementNode = Tiny &
	ConcreteElementNode & {
		attributes?: (ConcreteAttributeNode | TinyAttributeNode)[];
		childNodes?: (ConcreteChildNode | TinyChildNode)[];
	};
export type TinyAttributeNode = Tiny & ConcreteAttributeNode;
export type TinyTextNode = Tiny & ConcreteTextNode;
export type TinyCommentNode = Tiny & ConcreteCommentNode;
export type TinyCDATASectionNode = Tiny & ConcreteCDATASectionNode;
export type TinyProcessingInstructionNode = Tiny & ConcreteProcessingInstructionNode;
export type TinyDocumentNode = Tiny &
	ConcreteDocumentNode & {
		childNodes?: ConcreteChildNode[];
	};

export type TinyParentNode = TinyElementNode | TinyDocumentNode;

export type TinyChildNode =
	| TinyElementNode
	| TinyTextNode
	| TinyProcessingInstructionNode
	| TinyCommentNode
	| TinyCDATASectionNode;

export type TinyCharacterDataNode =
	| TinyTextNode
	| TinyCDATASectionNode
	| TinyProcessingInstructionNode
	| TinyCommentNode;

export type TinyNode = TinyChildNode | TinyParentNode | TinyAttributeNode;

// Graft and Pointers
export type GraftPoint = {
	graftAncestor: GraftPoint | null;
	offset: number | string;
	parent: TinyParentNode | TinyElementNode;
};

export function isTinyNode(node: ConcreteNode | TinyNode): node is TinyNode {
	return (node as TinyNode).isTinyNode !== undefined;
}

export type Pointer<TNode extends ConcreteNode, TTiny extends TinyNode> = {
	graftAncestor: GraftPoint | null;
	node: TNode | TTiny;
};

export type AttributeNodePointer = Pointer<ConcreteAttributeNode, TinyAttributeNode>;
export type CDATASectionNodePointer = Pointer<ConcreteCDATASectionNode, TinyCDATASectionNode>;
export type CommentNodePointer = Pointer<ConcreteCommentNode, TinyCommentNode>;
export type DocumentNodePointer = Pointer<ConcreteDocumentNode, TinyDocumentNode>;
export type ElementNodePointer = Pointer<ConcreteElementNode, TinyElementNode>;
export type ProcessingInstructionNodePointer = Pointer<
	ConcreteProcessingInstructionNode,
	TinyProcessingInstructionNode
>;
export type TextNodePointer = Pointer<ConcreteTextNode, TinyTextNode>;

export type NodePointer = Pointer<ConcreteNode, TinyNode>;
export type CharacterDataNodePointer = Pointer<ConcreteCharacterDataNode, TinyCharacterDataNode>;
export type ChildNodePointer = Pointer<ConcreteChildNode, TinyChildNode>;
export type ParentNodePointer = Pointer<ConcreteParentNode, TinyParentNode>;
