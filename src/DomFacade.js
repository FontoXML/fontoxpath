/**
 * Facade for dom interface things, compatible with blueprintQuery. Pass a readonlyDomFacade to use the live DOM
 * @constructor
 * @param  {!DomFacade}  blueprint
 */
function DomFacade (blueprint) {
    this._blueprint = blueprint;

    this._createdNodeValuesByNodeId = Object.create(null);
}

/**
 * @param  {!Node}  node
 * @return  {boolean}
 */
DomFacade.prototype.isAttributeNode = DomFacade.isAttributeNode = function (node) {
    return node.nodeType === node.ATTRIBUTE_NODE;
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getParentNode = function (node) {
    if (this.isAttributeNode(node)) {
        return node.getParentNode();
    }
    return this._blueprint.getParentNode(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getFirstChild = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }
    return this._blueprint.getFirstChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getLastChild = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._blueprint.getLastChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getNextSibling = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._blueprint.getNextSibling(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getPreviousSibling = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._blueprint.getPreviousSibling(node);
};

/**
 * @param  {!Node}  node
 * @return  {!Array<!Node>}
 */
DomFacade.prototype.getChildNodes = function (node) {
    if (this.isAttributeNode(node)) {
        return [];
    }

    var childNodes = [];

    for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
        childNodes.push(childNode);
    }

    return childNodes;
};

DomFacade.prototype.getAttribute = function (node, attributeName) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    var value = this._blueprint.getAttribute(node, attributeName);
    if (!value) {
        return null;
    }
    return value;
};

DomFacade.prototype.getAllAttributes = function (node) {
    if (this.isAttributeNode(node)) {
        return [];
    }

    return this._blueprint.getAllAttributes(node);
};

DomFacade.prototype.getData = function (node) {
    if (this.isAttributeNode(node)) {
        return node.value;
    }

    return this._blueprint.getData(node) || '';
};

// Can be used to create an extra frame when tracking dependencies
DomFacade.prototype.getRelatedNodes = function (node, callback) {
    return callback();
};

export default DomFacade;
