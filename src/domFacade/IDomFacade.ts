import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode
} from './ConcreteNode';

export default interface IDomFacade {
	getAllAttributes(node: ConcreteElementNode): ConcreteAttributeNode[];
	getAttribute(node: ConcreteElementNode, attributeName: string): string;
	getChildNodes(node: ConcreteParentNode): ConcreteChildNode[];
	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string;
	getFirstChild(node: ConcreteParentNode): ConcreteChildNode;
	getLastChild(node: ConcreteParentNode): ConcreteChildNode;
	getNextSibling(node: ConcreteChildNode): ConcreteChildNode;
	getParentNode(node: ConcreteNode): ConcreteParentNode;
	getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode;
}
