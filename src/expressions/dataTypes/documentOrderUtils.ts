import {
	AttributeNodePointer,
	ChildNodePointer,
	NodePointer,
	isTinyNode,
} from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import { ConcreteNode, ConcreteChildNode, ConcreteParentNode } from '../../domFacade/ConcreteNode';
import arePointersEqual from '../operators/compares/arePointersEqual';
import isSubtypeOf from './isSubtypeOf';
import Value from './Value';

/**
 * Compares positions of given nodes in the given state, assuming they share a common parent
 *
 * @param  domFacade The domFacade in which to consider the nodes
 * @param  node1     The first node
 * @param  node2      The second node
 *
 * @return Returns 0 if node1 equals node2, -1 if node1 precedes node2, and 1 otherwise
 */
function compareSiblingElements(
	domFacade: DomFacade,
	node1: NodePointer,
	node2: NodePointer
): number {
	if (arePointersEqual(node1, node2)) {
		return 0;
	}

	const parentNode = domFacade.getParentNodePointer(node1 as ChildNodePointer, null);
	const childNodes = domFacade.getChildNodePointers(parentNode, null);
	for (let i = 0, l = childNodes.length; i < l; ++i) {
		const childNode = childNodes[i];
		if (arePointersEqual(childNode, node1)) {
			return -1;
		}
		if (arePointersEqual(childNode, node2)) {
			return 1;
		}
	}
	throw new Error('Nodes are not in same tree');
}

/**
 * Find all ancestors of the given node
 *
 * @param	domFacade  The domFacade to consider relations in
 * @param	node       The node to find all ancestors of
 * @return	All of the ancestors of the given node
 */
function findAllAncestorPointers(domFacade: DomFacade, node: NodePointer): NodePointer[] {
	const ancestors: NodePointer[] = [];
	for (
		let ancestor = node;
		ancestor;
		ancestor = domFacade.getParentNodePointer(
			ancestor as ChildNodePointer | AttributeNodePointer,
			null
		)
	) {
		ancestors.unshift(ancestor);
	}

	return ancestors;
}

function findAllAncestors(domFacade: DomFacade, node: ConcreteNode): ConcreteNode[] {
	const ancestors = [];
	for (
		let ancestor = node;
		ancestor;
		ancestor = domFacade.getParentNode(ancestor as ConcreteChildNode, null)
	) {
		ancestors.unshift(ancestor);
	}

	return ancestors;
}

function wrapToPointer(node: ConcreteNode): NodePointer {
	return { node, graftAncestor: null };
}

/**
 * Compares the given positions w.r.t. document order in this state
 *
 * @param tieBreakerArr  Results of earlier comparisons, used as a tie breaker for compares between documents
 * @param domFacade        The domFacade in which to consider the nodes
 * @param nodeA
 * @param nodeB
 *
 * @return Returns 0 if the positions are equal, -1 if the first position precedes the second, and 1 otherwise.
 */
function compareElements(
	tieBreakerArr: NodePointer[],
	domFacade: DomFacade,
	nodeA: NodePointer,
	nodeB: NodePointer
): number {
	if (
		!nodeA.graftAncestor &&
		!nodeB.graftAncestor &&
		!isTinyNode(nodeA.node) &&
		!isTinyNode(nodeB.node)
	) {
		// Comparing normal nodes. Can be optimized by disregarding pointers for ancestors
		const actualNodeA = nodeA.node;
		const actualNodeB = nodeB.node;

		if (actualNodeA === actualNodeB) {
			return 0;
		}

		const actualAncestorsA = findAllAncestors(domFacade, actualNodeA);
		const actualAncestorsB = findAllAncestors(domFacade, actualNodeB);

		if (actualAncestorsA[0] !== actualAncestorsB[0]) {
			const topAncestorPointerA = wrapToPointer(actualAncestorsA[0]);
			const topAncestorPointerB = wrapToPointer(actualAncestorsB[0]);
			// Separate trees, use earlier determined tie breakers
			let index1 = tieBreakerArr.findIndex((e) => arePointersEqual(e, topAncestorPointerA));
			let index2 = tieBreakerArr.findIndex((e) => arePointersEqual(e, topAncestorPointerB));
			if (index1 === -1) {
				index1 = tieBreakerArr.push(topAncestorPointerA);
			}
			if (index2 === -1) {
				index2 = tieBreakerArr.push(topAncestorPointerB);
			}
			return index1 - index2;
		}

		let y, z;
		for (y = 1, z = Math.min(actualAncestorsA.length, actualAncestorsB.length); y < z; ++y) {
			if (actualAncestorsA[y] !== actualAncestorsB[y]) {
				break;
			}
		}

		const actualAncestorA = actualAncestorsA[y];
		const actualAncestorB = actualAncestorsB[y];

		if (!actualAncestorA) {
			// All nodes under a node are higher in document order than said node
			return -1;
		}
		if (!actualAncestorB) {
			// All nodes under a node are higher in document order than said node
			return 1;
		}

		if (actualAncestorA === actualAncestorB) {
			return 0;
		}
		// Compare positions under the common ancestor
		const parentNode = actualAncestorsB[y - 1];
		const childNodes = domFacade.getChildNodes(parentNode as ConcreteParentNode, null);
		for (let m = 0, n = childNodes.length; m < n; ++m) {
			const childNode = childNodes[m];
			if (childNode === actualAncestorA) {
				return -1;
			}
			if (childNode === actualAncestorB) {
				return 1;
			}
		}
		throw new Error('Nodes are not in same tree');
	} else {
		if (arePointersEqual(nodeA, nodeB)) {
			return 0;
		}
		const ancestors1 = findAllAncestorPointers(domFacade, nodeA);
		const ancestors2 = findAllAncestorPointers(domFacade, nodeB);
		const topAncestor1 = ancestors1[0];
		const topAncestor2 = ancestors2[0];

		if (!arePointersEqual(topAncestor1, topAncestor2)) {
			// Separate trees, use earlier determined tie breakers
			let index1 = tieBreakerArr.findIndex((e) => arePointersEqual(e, topAncestor1));
			let index2 = tieBreakerArr.findIndex((e) => arePointersEqual(e, topAncestor2));
			if (index1 === -1) {
				index1 = tieBreakerArr.push(topAncestor1);
			}
			if (index2 === -1) {
				index2 = tieBreakerArr.push(topAncestor2);
			}
			return index1 - index2;
		}

		// Skip common ancestors
		let i, l;
		for (i = 1, l = Math.min(ancestors1.length, ancestors2.length); i < l; ++i) {
			if (!arePointersEqual(ancestors1[i], ancestors2[i])) {
				break;
			}
		}

		if (!ancestors1[i]) {
			// All nodes under a node are higher in document order than said node
			return -1;
		}
		if (!ancestors2[i]) {
			// All nodes under a node are higher in document order than said node
			return 1;
		}
		// Compare positions under the common ancestor
		return compareSiblingElements(domFacade, ancestors1[i], ancestors2[i]);
	}
}
function compareNodePositionsWithTieBreaker(tieBreakerArr, domFacade, node1, node2) {
	const isNode1SubtypeOfAttribute = isSubtypeOf(node1.type, 'attribute()');
	const isNode2SubtypeOfAttribute = isSubtypeOf(node2.type, 'attribute()');
	let value1, value2;
	if (isNode1SubtypeOfAttribute && !isNode2SubtypeOfAttribute) {
		value1 = domFacade.getParentNodePointer(node1.value);
		value2 = node2.value;
		if (arePointersEqual(value1, value2)) {
			// Same element, so A
			return 1;
		}
	} else if (isNode2SubtypeOfAttribute && !isNode1SubtypeOfAttribute) {
		value1 = node1.value;
		value2 = domFacade.getParentNodePointer(node2.value);
		if (arePointersEqual(value1, value2)) {
			// Same element, so B before A
			return -1;
		}
	} else if (isNode1SubtypeOfAttribute && isNode2SubtypeOfAttribute) {
		if (
			arePointersEqual(
				domFacade.getParentNodePointer(node2.value),
				domFacade.getParentNodePointer(node1.value)
			)
		) {
			// Sort on attributes name
			return domFacade.getLocalName(node1.value) > domFacade.getLocalName(node2.value)
				? 1
				: -1;
		}
		value1 = domFacade.getParentNodePointer(node1.value);
		value2 = domFacade.getParentNodePointer(node2.value);
	} else {
		value1 = node1.value;
		value2 = node2.value;
	}

	return compareElements(tieBreakerArr, domFacade, value1, value2);
}

export function compareNodePositions(domFacade, node1, node2) {
	return compareNodePositionsWithTieBreaker(
		domFacade.orderOfDetachedNodes,
		domFacade,
		node1,
		node2
	);
}

/**
 * Sort (and deduplicate) the nodeValues in DOM order
 * Attributes are placed after their elements, before childnodes.
 * Attributes are sorted alphabetically by their names
 *
 * @param	domFacade
 * @param	nodeValues
 *
 * @return  The sorted nodes
 */
export function sortNodeValues(domFacade: DomFacade, nodeValues: Value[]): Value[] {
	return nodeValues
		.sort((node1, node2) =>
			compareNodePositionsWithTieBreaker(
				domFacade.orderOfDetachedNodes,
				domFacade,
				node1,
				node2
			)
		)
		.filter((nodeValue, i, sortedNodes) => {
			if (i === 0) {
				return true;
			}
			return !arePointersEqual(
				nodeValue.value as NodePointer,
				sortedNodes[i - 1].value as NodePointer
			);
		});
}
