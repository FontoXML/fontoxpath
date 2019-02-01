import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode
} from './ConcreteNode';
import IDomFacade from './IDomFacade';

export default interface IWrappingDomFacade extends IDomFacade {
	orderOfDetachedNodes: ConcreteNode[];

	getAllAttributes(node: ConcreteElementNode): ConcreteAttributeNode[];
	getAttribute(node: ConcreteElementNode, attributeName: string): string;
	getChildNodes(node: ConcreteParentNode): ConcreteChildNode[];
	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string;
	getFirstChild(node: ConcreteParentNode): ConcreteChildNode;
	getLastChild(node: ConcreteParentNode): ConcreteChildNode;
	getNextSibling(node: Node): ConcreteChildNode;
	getParentNode(node: ConcreteChildNode | ConcreteAttributeNode): ConcreteParentNode;
	getPreviousSibling(node: ConcreteChildNode): ConcreteChildNode;

	unwrap(): IDomFacade;
}
