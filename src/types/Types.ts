/**
 * @public
 */
export type Node = {
	nodeType: number;
};

/**
 * @public
 */
export type Attr = Node & {
	localName: string;
	name: string;
	namespaceURI: string | null;
	nodeName: string;
	prefix: string | null;
	value: string;
};

/**
 * @public
 */
export type CharacterData = Node & { data: string };

/**
 * @public
 */
export type CDATASection = CharacterData;

/**
 * @public
 */
export type Comment = CharacterData;

/**
 * @public
 */
export type Document = Node & {
	implementation: {
		createDocument(namespaceURI: null, qualifiedNameStr: null, documentType: null): Document;
	};
	createAttributeNS(namespaceURI: string, name: string): Attr;
	createCDATASection(contents: string): CDATASection;
	createComment(data: string): Comment;
	createElementNS(namespaceURI: string, qualifiedName: string): Element;
	createProcessingInstruction(target: string, data: string): ProcessingInstruction;
	createTextNode(data: string): Text;
};

/**
 * @public
 */
export type Element = Node & {
	localName: string;
	namespaceURI: string | null;
	nodeName: string;
	prefix: string | null;
};

/**
 * @public
 */
export type ProcessingInstruction = CharacterData & {
	nodeName: string;
	target: string;
};

/**
 * @public
 */
export type Text = CharacterData;

export type DocumentTypeNode = Node;
