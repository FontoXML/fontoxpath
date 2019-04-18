export type Node = {
	nodeType: number;
};

export type Attr = Node & {
	localName: string;
	name: string;
	namespaceURI: string;
	nodeName: string;
	prefix: string;
	value: string;
};

export type CharacterData = Node & { data: string };

export type CDATASection = CharacterData;

export type Comment = CharacterData;

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

export type Element = Node & {
	data: string;
	localName: string;
	namespaceURI: string;
	nodeName: string;
	prefix: string;
};

export type ProcessingInstruction = CharacterData & {
	nodeName: string;
	target: string;
};

export type Text = CharacterData;
