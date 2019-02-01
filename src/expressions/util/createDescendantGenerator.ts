import {
	ConcreteParentNode,
	NODE_TYPES,
	ConcreteNode,
	ConcreteChildNode
} from '../../domFacade/ConcreteNode';
import IWrappingDomFacade from '../../domFacade/IWrappingDomFacade';
import createNodeValue from '../dataTypes/createNodeValue';
import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, ready } from './iterators';

function findDeepestLastDescendant(
	node: ConcreteNode,
	domFacade: IWrappingDomFacade
): ConcreteNode {
	if (node.nodeType !== NODE_TYPES.ELEMENT_NODE && node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return node;
	}

	let parentNode = node;
	let childNode = domFacade.getLastChild(node);
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
	domFacade: IWrappingDomFacade,
	node: ConcreteNode,
	returnInReverse = false
) {
	if (returnInReverse) {
		let currentNode: ConcreteNode = node;
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
					currentNode.nodeType === NODE_TYPES.DOCUMENT_NODE ||
					currentNode.nodeType === NODE_TYPES.ATTRIBUTE_NODE
						? null
						: domFacade.getPreviousSibling(currentNode);
				if (previousSibling !== null) {
					currentNode = findDeepestLastDescendant(previousSibling, domFacade);
					return ready(createNodeValue(currentNode));
				}

				currentNode =
					currentNode.nodeType === NODE_TYPES.DOCUMENT_NODE
						? null
						: domFacade.getParentNode(currentNode);
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
