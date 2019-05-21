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

	getAllAttributes(node: ConcreteElementNode, bucket: string|null): ConcreteAttributeNode[];
	getAttribute(node: ConcreteElementNode, attributeName: string): string;
	getChildNodes(node: ConcreteParentNode, bucket: string|null): ConcreteChildNode[];
	getData(node: ConcreteAttributeNode | ConcreteCharacterDataNode): string;
	getFirstChild(node: ConcreteParentNode, bucket: string|null): ConcreteChildNode;
	getLastChild(node: ConcreteParentNode, bucket: string|null): ConcreteChildNode;
	getNextSibling(node: Node, bucket: string|null): ConcreteChildNode;
	getParentNode(
		node: ConcreteChildNode | ConcreteAttributeNode,
		bucket: string|null
	): ConcreteParentNode;
	getPreviousSibling(node: ConcreteChildNode, bucket: string|null): ConcreteChildNode;

	unwrap(): IDomFacade;
}
