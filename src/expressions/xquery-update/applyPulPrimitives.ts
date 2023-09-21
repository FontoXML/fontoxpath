import IDocumentWriter from '../../documentWriter/IDocumentWriter';
import {
	AttributeNodePointer,
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
	NodePointer,
	ProcessingInstructionNodePointer,
	TinyElementNode,
} from '../../domClone/Pointer';
import { ConcreteElementNode, NODE_TYPES } from '../../domFacade/ConcreteNode';
import DomFacade from '../../domFacade/DomFacade';
import DomBackedNodesFactory from '../../nodesFactory/DomBackedNodesFactory';
import INodesFactory from '../../nodesFactory/INodesFactory';
import { Attr, Document, Element } from '../../types/Types';
import QName from '../dataTypes/valueTypes/QName';
import { errXUDY0021 } from './XQueryUpdateFacilityErrors';

function hasAttribute(
	target: ElementNodePointer,
	localName: string,
	namespace: string,
	domFacade: DomFacade,
): boolean {
	return domFacade
		.getAllAttributePointers(target, `name-${localName}`)
		.some(
			(attr) =>
				domFacade.getLocalName(attr) === localName &&
				domFacade.getNamespaceURI(attr) === namespace,
		);
}

/**
 * Deletes $target.
 *
 * @param  target          The target to delete.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const deletePu = (
	target: AttributeNodePointer | ChildNodePointer,
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	const parentPointer = domFacade.getParentNodePointer(target);
	const parent = parentPointer ? parentPointer.node : null;
	if (parent) {
		if (domFacade.getNodeType(target) === NODE_TYPES.ATTRIBUTE_NODE) {
			documentWriter.removeAttributeNS(
				parent as Element,
				domFacade.getNamespaceURI(target as AttributeNodePointer),
				domFacade.getLocalName(target as AttributeNodePointer),
			);
		} else {
			documentWriter.removeChild(parent as Document | Element, target.node);
		}
	}
};

/**
 * Inserts $content immediately after $target.
 *
 * @param  target          The target to insert after.
 * @param  content         The content.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertAfter = (
	target: ChildNodePointer,
	content: NodePointer[],
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	// The parent must exist or an error has been raised.
	const parent = domFacade.getParentNodePointer(target).node;
	const nextSiblingPointer = domFacade.getNextSiblingPointer(target);
	const nextSibling = nextSiblingPointer ? nextSiblingPointer.node : null;

	content.forEach((pointer) => {
		documentWriter.insertBefore(parent as Element, pointer.node, nextSibling);
	});
};

/**
 * Inserts $content immediately before $target.
 *
 * @param  target          The target to insert before.
 * @param  content         The content.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertBefore = (
	target: ChildNodePointer,
	content: NodePointer[],
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	// The parent must exist or an error has been raised.
	const parent = domFacade.getParentNodePointer(target).node;

	content.forEach((pointer) => {
		documentWriter.insertBefore(parent as Element, pointer.node, target.node);
	});
};

/**
 * Inserts $content as the children of $target, in an implementation-dependent position.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertInto = (
	target: ElementNodePointer | DocumentNodePointer,
	content: NodePointer[],
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	insertIntoAsLast(target, content, documentWriter);
};

/**
 * Inserts $content as the first children of $target.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertIntoAsFirst = (
	target: ElementNodePointer | DocumentNodePointer,
	content: NodePointer[],
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	const firstChildPointer = domFacade.getFirstChildPointer(target);
	const firstChild = firstChildPointer ? firstChildPointer.node : null;
	content.forEach((pointer) => {
		documentWriter.insertBefore(target.node, pointer.node, firstChild);
	});
};

/**
 * Inserts $content as the last children of $target.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertIntoAsLast = (
	target: ElementNodePointer | DocumentNodePointer,
	content: NodePointer[],
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	content.forEach((pointer) => {
		documentWriter.insertBefore(target.node, pointer.node, null);
	});
};

/**
 * Inserts $content as attributes of $target.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertAttributes = (
	target: ElementNodePointer,
	content: AttributeNodePointer[],
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	content.forEach((attributeNodePointer) => {
		const attrLocalName = domFacade.getLocalName(attributeNodePointer);
		const attrNamespace = domFacade.getNamespaceURI(attributeNodePointer);
		if (hasAttribute(target, attrLocalName, attrNamespace, domFacade)) {
			throw errXUDY0021(
				`An attribute ${
					attrNamespace ? `Q{${attrNamespace}}${attrLocalName}` : attrLocalName
				} already exists.`,
			);
		}
		documentWriter.setAttributeNS(
			target.node,
			attrNamespace,
			attrLocalName,
			domFacade.getDataFromPointer(attributeNodePointer),
		);
	});
};

/**
 * Changes the node-name of $target to $newName.
 *
 * @param  target          The target to replace.
 * @param  newName         The new name.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  nodesFactory    The nodesFactory for creating nodes.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const rename = (
	target: AttributeNodePointer | ElementNodePointer | ProcessingInstructionNodePointer,
	newName: QName | null,
	domFacade: (DomFacade | null) | undefined,
	nodesFactory: (INodesFactory | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	if (!nodesFactory) {
		nodesFactory = new DomBackedNodesFactory(target ? target.node : null);
	}

	let replacement;

	switch (domFacade.getNodeType(target)) {
		case NODE_TYPES.ELEMENT_NODE: {
			const attributes = domFacade.getAllAttributes(
				target.node as ConcreteElementNode | TinyElementNode,
			);
			const childNodes = domFacade.getChildNodes(
				target.node as ConcreteElementNode | TinyElementNode,
			);
			const replacementNode = nodesFactory.createElementNS(
				newName.namespaceURI,
				newName.buildPrefixedName(),
			);
			replacement = { node: replacementNode, graftAncestor: null };

			attributes.forEach((attribute) => {
				documentWriter.setAttributeNS(
					replacementNode,
					attribute.namespaceURI,
					attribute.nodeName,
					attribute.value,
				);
			});
			childNodes.forEach((childNode) => {
				documentWriter.insertBefore(replacementNode, childNode, null);
			});
			break;
		}
		case NODE_TYPES.ATTRIBUTE_NODE: {
			const replacementAttr = nodesFactory.createAttributeNS(
				newName.namespaceURI,
				newName.buildPrefixedName(),
			);
			replacementAttr.value = domFacade.getDataFromPointer(target as AttributeNodePointer);
			replacement = { node: replacementAttr, graftAncestor: null };
			break;
		}
		case NODE_TYPES.PROCESSING_INSTRUCTION_NODE: {
			replacement = {
				node: nodesFactory.createProcessingInstruction(
					newName.buildPrefixedName(),
					domFacade.getDataFromPointer(target as ProcessingInstructionNodePointer),
				),
				graftAncestor: null,
			};
			break;
		}
	}

	if (!domFacade.getParentNodePointer(target)) {
		throw new Error('Not supported: renaming detached nodes.');
	}

	replaceNode(target, [replacement], domFacade, documentWriter);
};

/**
 * Replaces the existing children of the element node $target by the optional text node $text. The attributes of $target are not affected.
 *
 * @param  target          The target to replace.
 * @param  text            The replacement.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const replaceElementContent = (
	target: ElementNodePointer | DocumentNodePointer,
	text: NodePointer | null,
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	domFacade
		.getChildNodes(target.node)
		.forEach((child) => documentWriter.removeChild(target.node, child));
	if (text) {
		documentWriter.insertBefore(target.node, text.node, null);
	}
};

/**
 * Replaces $target with $replacement.
 *
 * @param  target          The target to replace.
 * @param  replacement     The replacement.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const replaceNode = (
	target: AttributeNodePointer | ChildNodePointer,
	replacement: (AttributeNodePointer | ChildNodePointer)[],
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	// The parent must exist or an error has been raised.
	const parent = domFacade.getParentNodePointer(target);
	const targetNodeType = domFacade.getNodeType(target);

	if (targetNodeType === NODE_TYPES.ATTRIBUTE_NODE) {
		const attrTarget = target as AttributeNodePointer;
		// All replacement must consist of attribute nodes.
		if (
			replacement.some(
				(candidate) => domFacade.getNodeType(candidate) !== NODE_TYPES.ATTRIBUTE_NODE,
			)
		) {
			throw new Error(
				'Constraint "If $target is an attribute node, $replacement must consist of zero or more attribute nodes." failed.',
			);
		}

		const element: Element = parent ? (parent.node as Element) : null;

		documentWriter.removeAttributeNS(
			element,
			domFacade.getNamespaceURI(attrTarget),
			domFacade.getLocalName(attrTarget),
		);
		replacement.forEach((attr: AttributeNodePointer) => {
			const attrLocalName = domFacade.getLocalName(attr);
			const attrNamespace = domFacade.getNamespaceURI(attr);
			if (
				hasAttribute(parent as ElementNodePointer, attrLocalName, attrNamespace, domFacade)
			) {
				throw errXUDY0021(
					`An attribute ${
						attrNamespace ? `Q{${attrNamespace}}${attrLocalName}` : attrLocalName
					} already exists.`,
				);
			}
			documentWriter.setAttributeNS(
				element,
				attrNamespace,
				attrLocalName,
				domFacade.getDataFromPointer(attr),
			);
		});
	}

	if (
		targetNodeType === NODE_TYPES.ELEMENT_NODE ||
		targetNodeType === NODE_TYPES.TEXT_NODE ||
		targetNodeType === NODE_TYPES.COMMENT_NODE ||
		targetNodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
	) {
		const followingPointer = domFacade.getNextSiblingPointer(target as ChildNodePointer);
		const following = followingPointer ? followingPointer.node : null;
		documentWriter.removeChild(parent.node as Document | Element, target.node);
		replacement.forEach((newNode) => {
			documentWriter.insertBefore(parent.node as Document | Element, newNode.node, following);
		});
	}
};

/**
 * Replaces the string value of $target with $string-value.
 *
 * @param  target          The target to replace.
 * @param  stringValue     The replacement.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const replaceValue = (
	target: ElementNodePointer | AttributeNodePointer,
	stringValue: string,
	domFacade: (DomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined,
) => {
	if (domFacade.getNodeType(target) === NODE_TYPES.ATTRIBUTE_NODE) {
		const element = domFacade.getParentNodePointer(target) as ElementNodePointer;
		if (element) {
			documentWriter.setAttributeNS(
				element.node,
				domFacade.getNamespaceURI(target),
				domFacade.getLocalName(target),
				stringValue,
			);
		} else {
			(target.node as Attr).value = stringValue;
		}
	} else {
		documentWriter.setData(target.node, stringValue);
	}
};
