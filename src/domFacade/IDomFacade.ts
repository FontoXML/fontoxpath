import ConcreteNode, { ConcreteElementNode, ConcreteDocumentNode, ConcreteChildNode, ConcreteParentNode } from "./ConcreteNode";

export default interface IDomFacade {
	orderOfDetachedNodes: ConcreteNode[];
	getParentNode (node: ConcreteNode) : ConcreteParentNode;
	getParentNode (node: ConcreteElementNode) : ConcreteParentNode;
	getFirstChild (node: ConcreteParentNode) : ConcreteChildNode;
	getLastChild (node: ConcreteParentNode) : ConcreteChildNode;
	getNextSibling (node: ConcreteChildNode) : ConcreteChildNode;
	getPreviousSibling (node: ConcreteChildNode) : ConcreteChildNode;
	getChildNodes (node: ConcreteParentNode) : ConcreteChildNode[];
	getAttribute (node: ConcreteElementNode, attributeName: string) : string;
	getAllAttributes (node: ConcreteElementNode) : Attr[];
	getData (node: Attr | CharacterData) : ConcreteNode;
}
