import { Node } from '../types/Types';
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

	getAllAttributes(node: ConcreteElementNode, bucket: string): ConcreteAttributeNode[];
	getAttribute(node: ConcreteElementNode, attributeName: string): string;
	getChildNodes(node: ConcreteParentNode, bucket: string): ConcreteChildNode[];
	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string;
	getFirstChild(node: ConcreteParentNode, bucket: string): ConcreteChildNode;
	getLastChild(node: ConcreteParentNode, bucket: string): ConcreteChildNode;
	getNextSibling(node: Node, bucket: string): ConcreteChildNode;
	getParentNode(node: ConcreteChildNode | ConcreteAttributeNode, bucket: string): ConcreteParentNode;
	getPreviousSibling(node: ConcreteChildNode, bucket: string): ConcreteChildNode;

	unwrap(): IDomFacade;
}
