export default interface IDocumentWriter {
	insertBefore (parent: Element, newNode: Node, referenceNode: (Node|null)): void;
	removeAttributeNS (node: Element, namespace: string, name: string): void;
	removeChild (parent: Element, child: Node): void;
	setAttributeNS (node: Element, namespace: string, name: string, value: string): void;
	setData (node: Node, data: string): void;
}
