/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 * @constructor
 * @implements {IDomFacade}
 * @param  {!IDomFacade}  domFacade
 */
function DomFacade (domFacade) {
    this._domFacade = domFacade;
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
    return this._domFacade.getParentNode(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getFirstChild = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }
    return this._domFacade.getFirstChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getLastChild = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._domFacade.getLastChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getNextSibling = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._domFacade.getNextSibling(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getPreviousSibling = function (node) {
    if (this.isAttributeNode(node)) {
        return null;
    }

    return this._domFacade.getPreviousSibling(node);
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

    var value = this._domFacade.getAttribute(node, attributeName);
    if (!value) {
        return null;
    }
    return value;
};

DomFacade.prototype.getAllAttributes = function (node) {
    if (this.isAttributeNode(node)) {
        return [];
    }

    return this._domFacade.getAllAttributes(node);
};

DomFacade.prototype.getData = function (node) {
    if (this.isAttributeNode(node)) {
        return node.value;
    }

    return this._domFacade.getData(node) || '';
};

// Can be used to create an extra frame when tracking dependencies
DomFacade.prototype.getRelatedNodes = function (node, callback) {
    return callback(node, this);
};

export default DomFacade;
