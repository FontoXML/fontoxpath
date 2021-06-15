import {
	AttributeNodePointer,
	CharacterDataNodePointer,
	ChildNodePointer,
	ElementNodePointer,
	GraftPoint,
	isTinyNode,
	NodePointer,
	ParentNodePointer,
	ProcessingInstructionNodePointer,
	TinyAttributeNode,
	TinyCharacterDataNode,
	TinyChildNode,
	TinyElementNode,
	TinyNode,
	TinyParentNode,
} from '../domClone/Pointer';
import {
	ConcreteAttributeNode,
	ConcreteCharacterDataNode,
	ConcreteChildNode,
	ConcreteElementNode,
	ConcreteNode,
	ConcreteParentNode,
	NODE_TYPES,
} from './ConcreteNode';
import IDomFacade from './IDomFacade';

function createPointer<TPointer extends NodePointer>(
	node: ConcreteNode | TinyNode,
	parent: ParentNodePointer | null,
	offset: string | number
): TPointer {
	let graftAncestor: GraftPoint = null;
	if (parent) {
		if (isTinyNode(parent.node)) {
			graftAncestor = {
				graftAncestor: parent.graftAncestor,
				offset,
				parent: parent.node,
			};
		} else if (parent.graftAncestor) {
			graftAncestor = parent.graftAncestor;
		}
	}

	const newPointer = { node, graftAncestor };
	return newPointer as TPointer;
}

/**
 * Adapter for the DOM, can be used to use a different DOM implementation
 */
class DomFacade {
	public orderOfDetachedNodes: NodePointer[];

	constructor(private readonly _domFacade: IDomFacade) {
		/**
		 * Defines the ordering of detached nodes, to ensure stable sorting of unrelated nodes.
		 */
		this.orderOfDetachedNodes = [];
	}

	public getAllAttributePointers(
		pointer: ElementNodePointer,
		bucket: string | null = null
	): AttributeNodePointer[] {
		return this.getAllAttributes(pointer.node, bucket).map(
			(attributeNode: ConcreteAttributeNode | TinyAttributeNode) =>
				createPointer(attributeNode, pointer, attributeNode.nodeName)
		);
	}

	public getAllAttributes(
		node: ConcreteElementNode | TinyElementNode,
		bucket: string | null = null
	): (ConcreteAttributeNode | TinyAttributeNode)[] {
		return isTinyNode(node)
			? node.attributes
			: this._domFacade['getAllAttributes'](node, bucket);
	}

	public getAttribute(pointer: ElementNodePointer, attributeName: string): string {
		const node = pointer.node;
		if (isTinyNode(node)) {
			// The lines can be hit when fn:id or fn:idref functions are run with a target node
			// whose root node is created by the document constructor.
			const attributeNode = node.attributes.find((attr) => attributeName === attr.name);
			return attributeNode ? attributeNode.value : null;
		} else {
			const value = this._domFacade['getAttribute'](node, attributeName);
			return value ? value : null;
		}
	}

	public getChildNodePointers(
		parentPointer: ParentNodePointer,
		bucket: string | null = null
	): ChildNodePointer[] {
		return this.getChildNodes(parentPointer.node, bucket).map(
			(childNode: ConcreteChildNode | TinyChildNode, index) =>
				createPointer(childNode, parentPointer, index)
		);
	}

	public getChildNodes(
		parentNode: ConcreteParentNode | TinyParentNode,
		bucket: string | null = null
	) {
		const childNodes = isTinyNode(parentNode)
			? parentNode.childNodes
			: this._domFacade['getChildNodes'](parentNode, bucket);

		if (parentNode.nodeType === NODE_TYPES.DOCUMENT_NODE) {
			return childNodes.filter(
				(childNode) => childNode['nodeType'] !== NODE_TYPES.DOCUMENT_TYPE_NODE
			);
		}

		return childNodes;
	}

	public getData(
		node:
			| ConcreteAttributeNode
			| TinyAttributeNode
			| TinyCharacterDataNode
			| ConcreteCharacterDataNode
	): string {
		if (isTinyNode(node)) {
			return node.nodeType === NODE_TYPES.ATTRIBUTE_NODE ? node.value : node.data;
		}
		return this._domFacade['getData'](node) || '';
	}

	/**
	 * Get the node or tiny node children of a given node or tiny node. Do not use if from those
	 * children a new (upwards) traversal will be started since the parent relationship might be lost.
	 */

	public getDataFromPointer(pointer: AttributeNodePointer | CharacterDataNodePointer): string {
		return this.getData(pointer.node);
	}

	public getFirstChildPointer(
		parentPointer: ParentNodePointer,
		bucket: string | null = null
	): ChildNodePointer {
		const parentNode = parentPointer.node;
		let firstChild: ConcreteChildNode | TinyChildNode;

		if (isTinyNode(parentNode)) {
			firstChild = parentNode.childNodes[0];
		} else {
			let child = this._domFacade['getFirstChild'](parentNode, bucket);
			if (child && child.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
				child = this._domFacade['getNextSibling'](child);
			}
			firstChild = child as ConcreteChildNode;
		}

		return firstChild ? createPointer(firstChild, parentPointer, 0) : null;
	}

	public getLastChildPointer(
		parentPointer: ParentNodePointer,
		bucket: string | null = null
	): ChildNodePointer {
		const parentNode = parentPointer.node;
		let lastChild: ConcreteChildNode | TinyChildNode;
		let lastIndex: number;
		if (isTinyNode(parentNode)) {
			lastIndex = parentNode.childNodes.length - 1;
			lastChild = parentNode.childNodes[lastIndex];
		} else {
			let child = this._domFacade['getLastChild'](parentNode, bucket);
			if (child && child.nodeType === NODE_TYPES.DOCUMENT_TYPE_NODE) {
				child = this._domFacade['getPreviousSibling'](child);
			}
			lastChild = child as ConcreteChildNode;
			lastIndex = this.getChildNodes(parentPointer.node, bucket).length - 1;
		}

		return lastChild ? createPointer(lastChild, parentPointer, lastIndex) : null;
	}

	public getLocalName(pointer: ElementNodePointer | AttributeNodePointer): string {
		return pointer.node.localName;
	}

	public getNamespaceURI(pointer: ElementNodePointer | AttributeNodePointer): string {
		return pointer.node.namespaceURI;
	}

	public getNextSiblingPointer(
		pointer: ChildNodePointer,
		bucket: string | null = null
	): ChildNodePointer {
		const node = pointer.node;
		let nextSibling;
		let parentPointer;
		let nextSiblingIndex;
		const graftAncestor = pointer.graftAncestor;
		if (isTinyNode(node)) {
			if (graftAncestor) {
				nextSiblingIndex = (graftAncestor.offset as number) + 1;
				nextSibling = graftAncestor.parent.childNodes[nextSiblingIndex];
			}
		} else {
			if (graftAncestor) {
				// This is a clone, use the ancestor anyway
				nextSiblingIndex = (graftAncestor.offset as number) + 1;
				parentPointer = this.getParentNodePointer(pointer, null);
				nextSibling = this.getChildNodes(parentPointer.node, bucket)[nextSiblingIndex];
			} else {
				nextSibling = node;
				while (nextSibling) {
					nextSibling = this._domFacade['getNextSibling'](nextSibling, bucket);
					if (nextSibling && nextSibling.nodeType !== NODE_TYPES.DOCUMENT_TYPE_NODE) {
						break;
					}
				}

				return nextSibling
					? {
							node: nextSibling as ConcreteChildNode,
							graftAncestor: null,
					  }
					: null;
			}
		}

		return nextSibling
			? createPointer(
					nextSibling as ConcreteChildNode,
					parentPointer || this.getParentNodePointer(pointer, bucket),
					nextSiblingIndex
			  )
			: null;
	}

	public getNodeName(pointer: ElementNodePointer | AttributeNodePointer): string {
		return pointer.node.nodeName;
	}

	public getNodeType(pointer: NodePointer): NODE_TYPES {
		return pointer.node.nodeType;
	}

	/**
	 * Get the raw parent node of a concrete node.
	 *
	 * Note that this code should not be called with node that comes from a pointer with a graft,
	 * since that graft will not be used.
	 *
	 * Also, tinyNodes do not have a logical parent, so that will also not work.
	 *
	 * This method can be used to more performantly get the parent of a node, to for instance more
	 * quickly determine the ancestry of a node that is not created nor cloned into another node.
	 */
	public getParentNode(
		node: ConcreteChildNode | ConcreteAttributeNode,
		bucket: string | null = null
	): ConcreteParentNode {
		return this._domFacade['getParentNode'](node, bucket) as ConcreteParentNode;
	}

	public getParentNodePointer(
		pointer: ChildNodePointer | AttributeNodePointer,
		bucket: string | null = null
	): ParentNodePointer {
		const childNode = pointer.node;
		const graftAncestor = pointer.graftAncestor;
		let parentNode;
		let newGraftAncestor;

		if (!graftAncestor) {
			// check dom, or null if tinyNode
			if (isTinyNode(childNode)) {
				return null;
			}
			parentNode = this.getParentNode(childNode, bucket);
			newGraftAncestor = null;
		} else if (
			// check the child at graftAncestor is that node
			(typeof graftAncestor.offset === 'number' &&
				childNode === graftAncestor.parent.childNodes[graftAncestor.offset]) ||
			(typeof graftAncestor.offset === 'string' &&
				childNode ===
					(graftAncestor.parent as TinyElementNode).attributes.find(
						(e) => graftAncestor.offset === e.nodeName
					))
		) {
			parentNode = graftAncestor.parent as TinyParentNode | ConcreteParentNode;
			newGraftAncestor = graftAncestor.graftAncestor;
		} else {
			// if not, go to the dom
			parentNode = this.getParentNode(childNode, bucket);
			newGraftAncestor = graftAncestor;
		}

		return parentNode ? { node: parentNode, graftAncestor: newGraftAncestor } : null;
	}

	public getPrefix(pointer: AttributeNodePointer | ElementNodePointer): string {
		return pointer.node.prefix;
	}

	public getPreviousSiblingPointer(
		pointer: ChildNodePointer,
		bucket: string | null = null
	): ChildNodePointer {
		const node = pointer.node;
		let previousSibling;
		let parentPointer;
		const graftAncestor = pointer.graftAncestor;
		let previousSiblingIndex;
		if (isTinyNode(node)) {
			if (graftAncestor) {
				previousSiblingIndex = (graftAncestor.offset as number) - 1;
				previousSibling = graftAncestor.parent.childNodes[previousSiblingIndex];
			}
		} else {
			if (graftAncestor) {
				// This is a clone, use the ancestor anyway
				previousSiblingIndex = (graftAncestor.offset as number) - 1;
				parentPointer = this.getParentNodePointer(pointer, null);
				previousSibling = this.getChildNodes(parentPointer.node, bucket)[
					previousSiblingIndex
				];
			} else {
				previousSibling = node;
				while (previousSibling) {
					previousSibling = this._domFacade['getPreviousSibling'](
						previousSibling,
						bucket
					);
					if (
						previousSibling &&
						previousSibling.nodeType !== NODE_TYPES.DOCUMENT_TYPE_NODE
					) {
						break;
					}
				}

				return previousSibling
					? {
							node: previousSibling as ConcreteChildNode,
							graftAncestor: null,
					  }
					: null;
			}
		}

		return previousSibling
			? createPointer(
					previousSibling as ConcreteChildNode,
					parentPointer || this.getParentNodePointer(pointer, bucket),
					previousSiblingIndex
			  )
			: null;
	}

	// Can be used to create an extra frame when tracking dependencies
	public getRelatedNodes(
		node: Node[],
		callback: (nodes: Node[], domFacade: DomFacade) => Node[]
	) {
		return callback(node, this);
	}

	public getTarget(pointer: ProcessingInstructionNodePointer): string {
		return pointer.node.target;
	}

	public unwrap(): IDomFacade {
		return this._domFacade;
	}
}
export default DomFacade;
