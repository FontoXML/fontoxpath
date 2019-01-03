import DomFacade from './DomFacade';

class DomBackedDomFacade extends DomFacade {
	getParentNode (node) {
		if (node.nodeType === 2) {
			return /** @type {!Attr} */(node).ownerElement;
		}
		return node.parentNode;
	}

	getFirstChild (node) {
		return node.firstChild;
	}

	getLastChild (node) {
		return node.lastChild;
	}

	getNextSibling (node) {
		return node.nextSibling;
	}

	getPreviousSibling (node) {
		return node.previousSibling;
	}

	getChildNodes (node) {
		var childNodes = [];

		for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	getAttribute (node, attributeName) {
		if (node.nodeType === 2) {
			return null;
		}
		return node.getAttribute(attributeName);
	}

	getAllAttributes (node) {
		if (node.nodeType === 2) {
			return [];
		}

		return Array.from(/** @type {!Iterable<Attr>} */ (node.attributes));
	}

	getData (node) {
		return node.data || '';
	}

	getRelatedNodes (node, callback) {
		return callback(node, this);
	}
}

export default new DomBackedDomFacade();
