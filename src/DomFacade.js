/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 * @constructor
 * @implements {IDomFacade}
 * @param  {!IDomFacade}  domFacade
 */
function DomFacade (domFacade) {
	/**
	 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
	 *
	 * @type {!Array<!./selectors/dataTypes/Value>}
	 */
	this.orderOfDetachedNodes = [];

	this._domFacade = domFacade;
}

/**
 * @param  {!Node}  node
 * @return  {boolean}
 */
function isAttributeNode (node) {
	return node.nodeType === 2;
}

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getParentNode = function (node) {
	return this._domFacade.getParentNode(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getFirstChild = function (node) {
	return this._domFacade.getFirstChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getLastChild = function (node) {
	return this._domFacade.getLastChild(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getNextSibling = function (node) {
	return this._domFacade.getNextSibling(node);
};

/**
 * @param  {!Node}  node
 * @return  {?Node}
 */
DomFacade.prototype.getPreviousSibling = function (node) {
	return this._domFacade.getPreviousSibling(node);
};

/**
 * @param  {!Node}  node
 * @return  {!Array<!Node>}
 */
DomFacade.prototype.getChildNodes = function (node) {
	var childNodes = [];

	for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
		childNodes.push(childNode);
	}

	return childNodes;
};

DomFacade.prototype.getAttribute = function (node, attributeName) {
	var value = this._domFacade.getAttribute(node, attributeName);
	if (!value) {
		return null;
	}
	return value;
};

DomFacade.prototype.getAllAttributes = function (node) {
	return this._domFacade.getAllAttributes(node);
};

DomFacade.prototype.getData = function (node) {
	if (isAttributeNode(node)) {
		return /** @type {!Attr} */(node).value;
	}

	return this._domFacade.getData(node) || '';
};

// Can be used to create an extra frame when tracking dependencies
DomFacade.prototype.getRelatedNodes = function (node, callback) {
	return callback(node, this);
};

export default DomFacade;
