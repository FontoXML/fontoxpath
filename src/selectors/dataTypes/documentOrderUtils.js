import NodeValue from './NodeValue';
import DomFacade from '../../DomFacade';
/**
 * Compares positions of given nodes in the given state, assuming they share a common parent
 *
 * @param {!DomFacade} domFacade The domFacade in which to consider the nodes
 * @param {?Node}      node1     The first node
 * @param {?Node}      node2     The second node
 *
 * @return {number} Returns 0 if node1 equals node2, -1 if node1 precedes node2, and 1 otherwise
 */
function compareSiblingPositions (domFacade, node1, node2) {
    if (node1 === node2) {
        return 0;
    }

    // If either one of the nodes describes an end, the other one precedes it.
    if (node2 === null) {
        return -1;
    }
    if (node1 === null) {
        return 1;
    }

	var parentNode = domFacade.getParentNode(node1);
    var childNodes = domFacade.getChildNodes(/** @type {!Node} */(parentNode));
    for (var i = 0, l = childNodes.length; i < l; ++i) {
        var childNode = childNodes[i];
        if (childNode === node1) {
            return -1;
        }
        if (childNode === node2) {
            return 1;
        }
    }
	throw new Error('Nodes are not in same tree');
}

/**
 * Find all ancestors of the given node
 *
 * @param   {!DomFacade}  domFacade  The domFacade to consider relations in
 * @param   {!Node}       node       The node to find all ancestors of
 * @return  {!Array<Node>}     All of the ancestors of the given node
 */
function findAllAncestors (domFacade, node) {
    var ancestors = [];
    for (var ancestor = node; ancestor; ancestor = domFacade.getParentNode(ancestor)) {
        ancestors.unshift(ancestor);
    }

    return ancestors;
}

/**
 * Compares the given positions w.r.t. document order in this state
 *
 * @param {!DomFacade} domFacade      The domFacade in which to consider the nodes
 * @param {!Node}      parentNode1    The parent of the first position
 * @param {?Node}      referenceNode1 The next sibling of the first position
 * @param {!Node}      parentNode2    The parent of the second position
 * @param {?Node}      referenceNode2 The next sibling of the second position
 *
 * @return {number}   Returns 0 if the positions are equal, -1 if the first position precedes the second,
 *                      and 1 otherwise.
 */
function comparePositions (domFacade, parentNode1, referenceNode1, parentNode2, referenceNode2) {
    var bias = 0;
    if (parentNode1 !== parentNode2) {
        var ancestors1 = findAllAncestors(domFacade, parentNode1),
            ancestors2 = findAllAncestors(domFacade, parentNode2);
        // Skip common ancestors
        var commonAncestor = null,
            i, l;
        for (i = 0, l = Math.min(ancestors1.length, ancestors2.length); i < l; ++i) {
            if (ancestors1[i] !== ancestors2[i]) {
				break;
			}

            commonAncestor = ancestors1[i];
        }
        // No defined ordering between different trees
        if (!commonAncestor) {
            return 0;
        }

        if (i < ancestors1.length) {
            referenceNode1 = ancestors1[i];
            // Position under node is higher in document order than a position directly before it
            bias = 1;
        }
        if (i < ancestors2.length) {
            referenceNode2 = ancestors2[i];
            // Position under node is higher in document order than a position directly before it
            bias = -1;
        }
    }
    // Compare positions under the common ancestor
    return compareSiblingPositions(domFacade, referenceNode1, referenceNode2) || bias;
}

export const compareNodePositions = function compareNodePositions (domFacade, node1, node2) {
	var value1, value2;
    if (node1.instanceOfType('attribute()') && !node2.instanceOfType('attribute()')) {
        value1 = domFacade.getParentNode(node1.value);
        value2 = node2.value;
        if (node1 === value2) {
            // Same element, so A
            return 1;
        }
    }
	else if (node2.instanceOfType('attribute()') && !node1.instanceOfType('attribute()')) {
        value1 = node1.value;
        value2 = domFacade.getParentNode(node2.value);
        if (value1 === value2) {
            // Same element, so B before A
            return -1;
        }
    }
	else if (node1.instanceOfType('attribute()') && node2.instanceOfType('attribute()')) {
        if (domFacade.getParentNode(node2.value) === domFacade.getParentNode(node1.value)) {
            // Sort on attributes name
            return node1.value.nodeName > node2.value.nodeName ? 1 : -1;
        }
        value1 = domFacade.getParentNode(node1.value);
        value2 = domFacade.getParentNode(node2.value);
    }
	else {
        value1 = node1.value;
        value2 = node2.value;
    }

    return comparePositions(
        domFacade,
        value1, domFacade.getFirstChild(value1),
        value2, domFacade.getFirstChild(value2));
};

/**
 * Sort (and deduplicate) the nodeValues in DOM order
 * Attributes are placed after their elements, before childnodes.
 * Attributes are sorted alphabetically by their names
 *
 * @param   {!DomFacade}         domFacade
 * @param   {!Array<NodeValue>}  nodeValues
 *
 * @return   {!Array<NodeValue>}  The sorted nodes
 */
export const sortNodeValues = function sortNodeValues (domFacade, nodeValues) {
    return nodeValues
        .sort(function (node1, node2) {
			return compareNodePositions(domFacade, node1, node2);
        })
        .filter(function (nodeValue, i, sortedNodes) {
            if (i === 0) {
                return true;
            }
            return nodeValue !== sortedNodes[i - 1];
        });
};
