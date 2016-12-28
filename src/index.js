import evaluateXPathToBoolean from './evaluateXPathToBoolean';
import evaluateXPathToFirstNode from './evaluateXPathToFirstNode';
import evaluateXPathToNodes from './evaluateXPathToNodes';
import evaluateXPathToNumber from './evaluateXPathToNumber';
import evaluateXPathToString from './evaluateXPathToString';
import evaluateXPathToStrings from './evaluateXPathToStrings';
import DomFacade from './DomFacade';

/**
 * @constructor
 * @extends {DomFacade}
 */
function ReadOnlyBlueprint () {}

/**
 * Returns the parent node of the given node according to the blueprint.
 *
 * @method getParentNode
 *
 * @param  {Node} node The node for which to retrieve the parent node
 *
 * @return {Node|null} The parent node of the given node, or null if there is none
 */
ReadOnlyBlueprint.prototype.getParentNode = (node) => {
    return node.parentNode;
};

/**
 * Returns the first child of the given node according to the blueprint.
 *
 * @method getFirstChild
 *
 * @param  {Node} node The node for which to retrieve the first child
 *
 * @return {Node|null} The first child of the given node, or null if there is none
 */
ReadOnlyBlueprint.prototype.getFirstChild = function (node) {
    return node.firstChild;
};

/**
 * Returns the last child of the given node according to the blueprint.
 *
 * @method getLastChild
 *
 * @param  {Node} node The node for which to retrieve the last child
 *
 * @return {Node|null} The last child of the given node, or null if there is none
 */
ReadOnlyBlueprint.prototype.getLastChild = function (node) {
    return node.lastChild;
};

/**
 * Returns the next sibling of the given node according to the blueprint.
 *
 * @method getNextSibling
 *
 * @param  {Node} node The node for which to retrieve the next sibling
 *
 * @return {Node|null} The next sibling of the given node, or null if there is none
 */
ReadOnlyBlueprint.prototype.getNextSibling = function (node) {
    return node.nextSibling;
};

/**
 * Returns the previous sibling of the given node according to the blueprint.
 *
 * @method getPreviousSibling
 *
 * @param  {Node} node The node for which to retrieve the previous sibling
 *
 * @return {Node|null} The previous sibling of the given node, or null if there is none
 */
ReadOnlyBlueprint.prototype.getPreviousSibling = function (node) {
    return node.previousSibling;
};

/**
 * Returns the child nodes of the given node according to the blueprint.
 *
 * @method getChildNodes
 *
 * @param  {Node} node The node for which to retrieve the child nodes
 *
 * @return {Array<Node>} The child nodes of the given node
 */
ReadOnlyBlueprint.prototype.getChildNodes = function (node) {
    var childNodes = [];

    for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
        childNodes.push(childNode);
    }

    return childNodes;
};

/**
 * Returns the value of the given node's attribute with the given name
 *
 * @method getAttribute
 *
 * @param  {Node}    node           Node for which to retrieve the attribute value
 * @param  {string}  attributeName  Name of the attribute to be retrieved
 *
 * @return {string|null} The value of the given attribute, or null if the attribute does
 *                         not exist.
 */
ReadOnlyBlueprint.prototype.getAttribute = function (node, attributeName) {
    return node.getAttribute(attributeName);
};

/**
 * Get all the attributes of this node, including attributes which are only known in the ReadOnlyBlueprint
 *
 * @param   {Node}  node  The node from which to get all of  the attributes
 *
 * @return  {Array<Object>}  The attributes of the given node, as an array of name/value objects.
 */
ReadOnlyBlueprint.prototype.getAllAttributes = function (node) {
	node['AAAA'] = 123456;
    return Array.from(/** @type {!Iterable<Attr>} */ (node.attributes));
};


/**
 * Returns the data for the given node according to the ReadOnlyBlueprint.
 *
 * @method getData
 *
 * @param  {Node} node The node for which to retrieve the data
 *
 * @return {string} The data for the given node
 */
ReadOnlyBlueprint.prototype.getData = function (node) {
    return node.data || '';
};

// Export the files for the closure compiler
this['selectors'] = {
    'domFacade': new ReadOnlyBlueprint(),
    'evaluateXPathToBoolean': evaluateXPathToBoolean,
    'evaluateXPathToFirstNode': evaluateXPathToFirstNode,
    'evaluateXPathToNodes': evaluateXPathToNodes,
    'evaluateXPathToNumber': evaluateXPathToNumber,
    'evaluateXPathToString': evaluateXPathToString,
    'evaluateXPathToStrings': evaluateXPathToStrings
};

/**
 * @export
 */
export default {
	test: 'ABCDEFG',
    domFacade: new ReadOnlyBlueprint(),
    evaluateXPathToBoolean: evaluateXPathToBoolean,
    evaluateXPathToFirstNode: evaluateXPathToFirstNode,
    evaluateXPathToNodes: evaluateXPathToNodes,
    evaluateXPathToNumber: evaluateXPathToNumber,
    evaluateXPathToString: evaluateXPathToString,
    evaluateXPathToStrings: evaluateXPathToStrings
};
