import {
	ConcreteChildNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
} from '../../domFacade/ConcreteNode';
import IWrappingDomFacade from '../../domFacade/IWrappingDomFacade';
import createNodeValue from '../dataTypes/createNodeValue';
import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, IterationHint, ready } from './iterators';

function findDeepestLastDescendant(
	node: ConcreteNode,
	domFacade: IWrappingDomFacade,
	bucket: string | null
): ConcreteNode {
	if (node.nodeType !== NODE_TYPES.ELEMENT_NODE && node.nodeType !== NODE_TYPES.DOCUMENT_NODE) {
		return node;
	}

	let parentNode = node;
	let childNode = domFacade.getLastChild(node, bucket);
	while (childNode !== null) {
		if (childNode.nodeType !== NODE_TYPES.ELEMENT_NODE) {
			return childNode;
		}
		parentNode = childNode;
		childNode = domFacade.getLastChild(parentNode, bucket);
	}
	return parentNode;
}

export default function createDescendantGenerator(
	domFacade: IWrappingDomFacade,
	node: ConcreteNode,
	returnInReverse = false,
	bucket: string | null
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
					currentNode = findDeepestLastDescendant(node, domFacade, bucket);
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
						: domFacade.getPreviousSibling(currentNode, bucket);
				if (previousSibling !== null) {
					currentNode = findDeepestLastDescendant(previousSibling, domFacade, bucket);
					return ready(createNodeValue(currentNode));
				}

				currentNode =
					currentNode.nodeType === NODE_TYPES.DOCUMENT_NODE
						? null
						: domFacade.getParentNode(currentNode, bucket);
				if (currentNode === node) {
					isDone = true;
					return DONE_TOKEN;
				}
				return ready(createNodeValue(currentNode));
			},
		};
	}

	const descendantIteratorStack = [createChildGenerator(domFacade, node, bucket)];
	return {
		next: () => {
			if (!descendantIteratorStack.length) {
				return DONE_TOKEN;
			}
			let value = descendantIteratorStack[0].next(IterationHint.NONE);
			while (value.done) {
				descendantIteratorStack.shift();
				if (!descendantIteratorStack.length) {
					return DONE_TOKEN;
				}
				value = descendantIteratorStack[0].next(IterationHint.NONE);
			}
			// Iterator over these children next
			descendantIteratorStack.unshift(createChildGenerator(domFacade, value.value, bucket));
			return ready(createNodeValue(value.value));
		},
	};
}
