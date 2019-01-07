export default interface INodesFactory {
	createAttributeNS (namespaceURI: string, name: string): Attr;

	createElementNS (namespaceURI: string, name: string): Element

	createComment (contents: string): Comment;

	createTextNode (contents: string): Text;

	createProcessingInstruction (target: string, data: string): ProcessingInstruction;
}
