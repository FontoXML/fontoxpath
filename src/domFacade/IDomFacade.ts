import {
	ConcreteNode,
	ConcreteElementNode,
	ConcreteChildNode,
	ConcreteParentNode,
	ConcreteAttributeNode,
	ConcreteCharacterDataNode
} from './ConcreteNode';

export default interface IDomFacade {
	getParentNode(node: ConcreteNode): ConcreteParentNode;
	getParentNode(node: ConcreteElementNode): ConcreteParentNode;
	getFirstChild(node: ConcreteParentNode): ConcreteChildNode;
	getLastChild(node: ConcreteParentNode): ConcreteChildNode;
	getNextSibling(node: ConcreteChildNode): ConcreteChildNode;
	getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode;
	getChildNodes(node: ConcreteParentNode): ConcreteChildNode[];
	getAttribute(node: ConcreteElementNode, attributeName: string): string;
	getAllAttributes(node: ConcreteElementNode): ConcreteAttributeNode[];
	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string;
}
