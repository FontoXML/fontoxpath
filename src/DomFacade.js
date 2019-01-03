import Value from './expressions/dataTypes/Value';

/**
 * @param  {!Node}  node
 * @return  {boolean}
 */
function isAttributeNode (node) {
	return node.nodeType === 2;
}

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 * @constructor
 * @param  {!IDomFacade}  domFacade
 */
class DomFacade {
	constructor (domFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 *
		 * @type {!Array<!Value>}
		 */
		this.orderOfDetachedNodes = [];

		this._domFacade = domFacade;
	}

	/**
	 * @param  {!Node}  node
	 * @return  {?Node}
	 */
	getParentNode (node) {
		return this._domFacade.getParentNode(node);
	}

	/**
	 * @param  {!Node}  node
	 * @return  {?Node}
	 */
	getFirstChild (node) {
		return this._domFacade.getFirstChild(node);
	}

	/**
	 * @param  {!Node}  node
	 * @return  {?Node}
	 */
	getLastChild (node) {
		return this._domFacade.getLastChild(node);
	}

	/**
	 * @param  {!Node}  node
	 * @return  {?Node}
	 */
	getNextSibling (node) {
		return this._domFacade.getNextSibling(node);
	}

	/**
	 * @param  {!Node}  node
	 * @return  {?Node}
	 */
	getPreviousSibling (node) {
		return this._domFacade.getPreviousSibling(node);
	}

	/**
	 * @param  {!Node}  node
	 * @return  {!Array<!Node>}
	 */
	getChildNodes (node) {
		var childNodes = [];

		for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	getAttribute (node, attributeName) {
		var value = this._domFacade.getAttribute(node, attributeName);
		if (!value) {
			return null;
		}
		return value;
	}

	getAllAttributes (node) {
		return this._domFacade.getAllAttributes(node);
	}

	getData (node) {
		if (isAttributeNode(node)) {
			return /** @type {!Attr} */(node).value;
		}

		return this._domFacade.getData(node) || '';
	}

	unwrap () {
		return this._domFacade;
	}

	// Can be used to create an extra frame when tracking dependencies
	getRelatedNodes (node, callback) {
		return callback(node, this);
	}

}
export default DomFacade;
