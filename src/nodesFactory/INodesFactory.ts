export default interface INodesFactory {
	createAttributeNS(namespaceURI: string, name: string): Attr;

	createComment(contents: string): Comment;

	createElementNS(namespaceURI: string, name: string): Element;

	createProcessingInstruction(target: string, data: string): ProcessingInstruction;

	createTextNode(contents: string): Text;
}
