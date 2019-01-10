import { errXUDY0021 } from './XQueryUpdateFacilityErrors';
import DomBackedNodesFactory from '../../nodesFactory/DomBackedNodesFactory';
import QName from '../dataTypes/valueTypes/QName';
import IDomFacade from '../../domFacade/IDomFacade';
import IDocumentWriter from '../../documentWriter/IDocumentWriter';
import INodesFactory from '../../nodesFactory/INodesFactory';
import {
	NODE_TYPES,
	ConcreteChildNode,
	ConcreteAttributeNode,
	ConcreteElementNode,
	ConcreteProcessingInstructionNode
} from '../../domFacade/ConcreteNode';

const ELEMENT_NODE = 1,
	ATTRIBUTE_NODE = 2,
	TEXT_NODE = 3,
	PROCESSING_INSTRUCTION_NODE = 7,
	COMMENT_NODE = 8;

/**
 * Deletes $target.
 *
 * @param  target          The target to delete.
 * @param  domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const deletePu = function(
	target: ConcreteAttributeNode | ConcreteChildNode,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	const parent = domFacade.getParentNode(target);
	if (parent) {
		if (target.nodeType === NODE_TYPES.ATTRIBUTE_NODE) {
			documentWriter.removeAttributeNS(
				parent as Element,
				target.namespaceURI,
				(target as Attr).name
			);
		} else {
			documentWriter.removeChild(parent as Document | Element, target);
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
export const insertAfter = function(
	target: ConcreteChildNode,
	content: Array<Node>,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	// The parent must exist or an error has been raised.
	const parent = /** @type {!Node} */ (domFacade.getParentNode(target));
	const nextSibling = domFacade.getNextSibling(target);

	content.forEach(node => {
		documentWriter.insertBefore(parent as Element, node, nextSibling);
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
export const insertBefore = function(
	target: ConcreteChildNode,
	content: Array<Node>,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	// The parent must exist or an error has been raised.
	const parent = domFacade.getParentNode(target);

	content.forEach(node => {
		documentWriter.insertBefore(parent as Element, node, target);
	});
};

/**
 * Inserts $content as the children of $target, in an implementation-dependent position.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertInto = function(
	target: Element | Document,
	content: Array<Node>,
	documentWriter: (IDocumentWriter | null) | undefined
) {
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
export const insertIntoAsFirst = function(
	target: Element | Document,
	content: Array<Node>,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	const firstChild = domFacade.getFirstChild(target);
	content.forEach(node => {
		documentWriter.insertBefore(target, node, firstChild);
	});
};

/**
 * Inserts $content as the last children of $target.
 *
 * @param  target          The target to insert into.
 * @param  content         The content.
 * @param  documentWriter  The documentWriter for writing changes.
 */
export const insertIntoAsLast = function(
	target: Element | Document,
	content: Array<Node>,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	content.forEach(node => {
		documentWriter.insertBefore(target, node, null);
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
export const insertAttributes = function(
	target: Element,
	content: Array<Attr>,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	content.forEach(attr => {
		if (domFacade.getAttribute(target, attr.name)) {
			throw errXUDY0021(`An attribute ${attr.name} already exists.`);
		}
		documentWriter.setAttributeNS(target, attr.namespaceURI, attr.name, attr.value);
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
export const rename = function(
	target: ConcreteAttributeNode | ConcreteElementNode | ConcreteProcessingInstructionNode,
	newName: QName | null,
	domFacade: (IDomFacade | null) | undefined,
	nodesFactory: (INodesFactory | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	if (!nodesFactory) {
		nodesFactory = new DomBackedNodesFactory(target);
	}

	let replacement;

	switch (target.nodeType) {
		case NODE_TYPES.ELEMENT_NODE: {
			const attributes = domFacade.getAllAttributes(target as Element);
			const childNodes = domFacade.getChildNodes(target as Element);
			replacement = nodesFactory.createElementNS(
				newName.namespaceURI,
				newName.buildPrefixedName()
			);

			attributes.forEach(attribute => {
				documentWriter.setAttributeNS(
					replacement as Element,
					attribute.namespaceURI,
					attribute.name,
					attribute.value
				);
			});
			childNodes.forEach(childNode => {
				documentWriter.insertBefore(replacement, childNode, null);
			});
			break;
		}
		case NODE_TYPES.ATTRIBUTE_NODE: {
			replacement = nodesFactory.createAttributeNS(
				newName.namespaceURI,
				newName.buildPrefixedName()
			);
			replacement.value = (target as Attr).value;
			break;
		}
		case NODE_TYPES.PROCESSING_INSTRUCTION_NODE: {
			replacement = nodesFactory.createProcessingInstruction(
				newName.buildPrefixedName(),
				(target as ProcessingInstruction).data
			);
			break;
		}
	}

	if (!domFacade.getParentNode(target)) {
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
export const replaceElementContent = function(
	target: Element | Document,
	text: Node | null,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	domFacade.getChildNodes(target).forEach(child => documentWriter.removeChild(target, child));
	if (text) {
		documentWriter.insertBefore(target, text, null);
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
export const replaceNode = function(
	target: ConcreteAttributeNode | ConcreteChildNode,
	replacement: Array<ConcreteAttributeNode | ConcreteChildNode>,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	// The parent must exist or an error has been raised.
	const parent = domFacade.getParentNode(target);

	if (target.nodeType === ATTRIBUTE_NODE) {
		// All replacement must consist of attribute nodes.
		if (replacement.some(candidate => candidate.nodeType !== ATTRIBUTE_NODE)) {
			throw new Error(
				'Constraint "If $target is an attribute node, $replacement must consist of zero or more attribute nodes." failed.'
			);
		}

		const element: Element = parent as Element;

		documentWriter.removeAttributeNS(element, target.namespaceURI, (target as Attr).name);
		replacement.forEach((attr: Attr) => {
			if (domFacade.getAttribute(element, attr.name)) {
				throw errXUDY0021(`An attribute ${attr.name} already exists.`);
			}
			documentWriter.setAttributeNS(element, attr.namespaceURI, attr.name, attr.value);
		});
	}

	if (
		target.nodeType === NODE_TYPES.ELEMENT_NODE ||
		target.nodeType === NODE_TYPES.TEXT_NODE ||
		target.nodeType === NODE_TYPES.COMMENT_NODE ||
		target.nodeType === NODE_TYPES.PROCESSING_INSTRUCTION_NODE
	) {
		const following = domFacade.getNextSibling(target);
		documentWriter.removeChild(parent as Document | Element, target);
		replacement.forEach(newNode => {
			documentWriter.insertBefore(parent as Document | Element, newNode, following);
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
export const replaceValue = function(
	target: Element | Attr,
	stringValue: string,
	domFacade: (IDomFacade | null) | undefined,
	documentWriter: (IDocumentWriter | null) | undefined
) {
	if (target.nodeType === ATTRIBUTE_NODE) {
		const element = domFacade.getParentNode(target as Attr) as Element;
		if (element) {
			documentWriter.setAttributeNS(
				element,
				target.namespaceURI,
				(target as Attr).name,
				stringValue
			);
		} else {
			(target as Attr).value = stringValue;
		}
	} else {
		documentWriter.setData(target, stringValue);
	}
};
