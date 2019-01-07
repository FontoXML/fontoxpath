export default interface IDomFacade {
	getParentNode (node: Node) : Node;
	getFirstChild (node: Node) : Node;
	getLastChild (node: Node) : Node;
	getNextSibling (node: Node) : Node;
	getPreviousSibling (node: Node) : Node;
	getChildNodes (node: Node) : Node[];
	getAttribute (node: Node, attributeName: string) : Attr;
	getAllAttributes (node: Node) : Attr[];
	getData (node: Node) : Node;
}
