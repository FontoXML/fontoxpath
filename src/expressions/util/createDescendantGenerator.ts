import {
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteParentNode,
	NODE_TYPES
} from '../../domFacade/ConcreteNode';
import IDomFacade from '../../domFacade/IDomFacade';
import createNodeValue from '../dataTypes/createNodeValue';
import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, ready } from './iterators';

function findDeepestLastDescendant(
	node: ConcreteChildNode | ConcreteDocumentNode,
	domFacade: IDomFacade
): ConcreteChildNode | ConcreteDocumentNode {
	if (node.nodeType !== NODE_TYPES.ELEMENT_NODE && node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return node;
	}

	let parentNode: ConcreteParentNode = node;
	let childNode: ConcreteChildNode = domFacade.getLastChild(node);
	while (childNode !== null) {
		if (childNode.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return childNode;
		}
		parentNode = childNode;
		childNode = domFacade.getLastChild(parentNode);
	}
	return parentNode;
}

export default function createDescendantGenerator(
	domFacade: IDomFacade,
	node: ConcreteParentNode,
	returnInReverse = false
) {
	if (returnInReverse) {
		let currentNode: ConcreteChildNode | ConcreteDocumentNode = node;
		let isDone = false;
		return {
			next: () => {
				if (isDone) {
					return DONE_TOKEN;
				}

				if (currentNode === node) {
					currentNode = findDeepestLastDescendant(node, domFacade);
					if (currentNode === node) {
						isDone = true;
						return DONE_TOKEN;
					}
					return ready(createNodeValue(currentNode));
				}

				const previousSibling =
					currentNode.nodeType === NODE_TYPES.DOCUMENT_NODE
						? null
						: domFacade.getPreviousSibling(currentNode);
				if (previousSibling !== null) {
					currentNode = findDeepestLastDescendant(previousSibling, domFacade);
					return ready(createNodeValue(currentNode));
				}

				currentNode = domFacade.getParentNode(currentNode);
				if (currentNode === node) {
					isDone = true;
					return DONE_TOKEN;
				}
				return ready(createNodeValue(currentNode));
			}
		};
	}

	const descendantIteratorStack = [createChildGenerator(domFacade, node)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next();
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next();
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value));
			return ready(createNodeValue(value.value));
		}
	};
}
