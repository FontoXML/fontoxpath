import createChildGenerator from './createChildGenerator';
import { DONE_TOKEN, ready } from './iterators';
import createNodeValue from '../dataTypes/createNodeValue';

function findDeepestLastDescendant (node, domFacade) {
	while (domFacade.getLastChild(node) !== null) {
		node = domFacade.getLastChild(node);
	}
	return node;
}

export default function createDescendantGenerator (domFacade, node, returnInReverse = false) {
	if (returnInReverse) {
		let currentNode = node;
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

				const previousSibling = domFacade.getPreviousSibling(currentNode);
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

	/**
	 * @type {!Array<!Iterator<!Node>>}
	 */
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
