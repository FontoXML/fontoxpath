import IDomFacade from './IDomFacade';

class DomBackedDomFacade implements IDomFacade {
	getParentNode (node: Node) {
		if (node['nodeType'] === 2) {
			return (node as Attr).ownerElement;
		}
		return node['parentNode'];
	}

	getFirstChild (node: Node): Node {
		return node['firstChild'];
	}

	getLastChild (node: Node): Node {
		return node['lastChild'];
	}

	getNextSibling (node: Node): Node {
		return node['nextSibling'];
	}

	getPreviousSibling (node: Node): Node {
		return node['previousSibling'];
	}

	getChildNodes (node: Node): Array<Node> {
		const childNodes = [];

		for (let childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
			childNodes.push(childNode);
		}

		return childNodes;
	}

	getAttribute (node, attributeName) {
		if (node['nodeType'] === 2) {
			return null;
		}
		return node['getAttribute'](attributeName);
	}

	getAllAttributes (node: Element) {
		if (node['nodeType'] === 2) {
			return [];
		}

		return Array.from(node['attributes']);
	}

	getData (node) {
		return node['data'] || '';
	}

	getRelatedNodes (node, callback) {
		return callback(node, this);
	}
}

export default new DomBackedDomFacade();
