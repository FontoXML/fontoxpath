import { errXUDY0021 } from './XQueryUpdateFacilityErrors';
import DomBackedNodesFactory from '../../DomBackedNodesFactory';
import QName from '../dataTypes/valueTypes/QName';

const ELEMENT_NODE = 1, ATTRIBUTE_NODE = 2, TEXT_NODE = 3, PROCESSING_INSTRUCTION_NODE = 7, COMMENT_NODE = 8;

/**
 * Deletes $target.
 *
 * @param  {!Node}              target          The target to delete.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const deletePu = function (target, domFacade, documentWriter) {
	const parent = domFacade.getParentNode(target);
	if (parent) {
		if (target.nodeType === ATTRIBUTE_NODE) {
			documentWriter.removeAttributeNS(/** @type {!Element} */(parent), target.namespaceURI, target.name);
		} else {
			documentWriter.removeChild(parent, target);
		}
	}
};

/**
 * Inserts $content immediately after $target.
 *
 * @param  {!Node}              target          The target to insert after.
 * @param  {!Array<!Node>}      content         The content.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertAfter = function (target, content, domFacade, documentWriter) {
	// The parent must exist or an error has been raised.
	const parent = (/** @type {!Node} */ (domFacade.getParentNode(target)));
	const nextSibling = domFacade.getNextSibling(target);

	content.forEach(node => {
		documentWriter.insertBefore(parent, node, nextSibling);
	});
};

/**
 * Inserts $content immediately before $target.
 *
 * @param  {!Node}              target          The target to insert before.
 * @param  {!Array<!Node>}      content         The content.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertBefore = function (target, content, domFacade, documentWriter) {
	// The parent must exist or an error has been raised.
	const parent = (/** @type {!Node} */ (domFacade.getParentNode(target)));

	content.forEach(node => {
		documentWriter.insertBefore(parent, node, target);
	});
};

/**
 * Inserts $content as the children of $target, in an implementation-dependent position.
 *
 * @param  {!Node}              target          The target to insert into.
 * @param  {!Array<!Node>}      content         The content.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertInto = function (target, content, documentWriter) {
	insertIntoAsLast(target, content, documentWriter);
};

/**
 * Inserts $content as the first children of $target.
 *
 * @param  {!Node}              target          The target to insert into.
 * @param  {!Array<!Node>}      content         The content.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertIntoAsFirst = function (target, content, domFacade, documentWriter) {
	const firstChild = domFacade.getFirstChild(target);
	content.forEach(node => {
		documentWriter.insertBefore(target, node, firstChild);
	});
};

/**
 * Inserts $content as the last children of $target.
 *
 * @param  {!Node}              target          The target to insert into.
 * @param  {!Array<!Node>}      content         The content.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertIntoAsLast = function (target, content, documentWriter) {
	content.forEach(node => {
		documentWriter.insertBefore(target, node, null);
	});
};

/**
 * Inserts $content as attributes of $target.
 *
 * @param  {!Element}           target          The target to insert into.
 * @param  {!Array<!Attr>}      content         The content.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const insertAttributes = function (target, content, domFacade, documentWriter) {
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
 * @param  {!Node}              target          The target to replace.
 * @param  {?QName}             newName         The new name.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?INodesFactory=}    nodesFactory    The nodesFactory for creating nodes.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const rename = function (target, newName, domFacade, nodesFactory, documentWriter) {
	if (!nodesFactory) {
		nodesFactory = new DomBackedNodesFactory(target);
	}

	let replacement;

	switch (target.nodeType) {
		case ELEMENT_NODE: {
			const attributes = domFacade.getAllAttributes(target);
			const childNodes = domFacade.getChildNodes(target);
			replacement = nodesFactory.createElementNS(newName.namespaceURI, newName.buildPrefixedName());

			attributes.forEach(attribute => {
				documentWriter.setAttributeNS(/** @type {!Element} */(replacement), attribute.namespaceURI, attribute.name, attribute.value);
			});
			childNodes.forEach(childNode => {
				documentWriter.insertBefore(replacement, childNode, null);
			});
			break;
		}
		case ATTRIBUTE_NODE: {
			replacement = nodesFactory.createAttributeNS(newName.namespaceURI, newName.buildPrefixedName());
			replacement.value = target.value;
			break;
		}
		case PROCESSING_INSTRUCTION_NODE: {
			replacement = nodesFactory.createProcessingInstruction(newName.buildPrefixedName(), target.data);
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
 * @param  {!Node}              target          The target to replace.
 * @param  {?Node}              text            The replacement.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const replaceElementContent = function (target, text, domFacade, documentWriter) {
	domFacade.getChildNodes(target).forEach(child => documentWriter.removeChild(target, child));
	if (text) {
		documentWriter.insertBefore(target, text, null);
	}
};

/**
 * Replaces $target with $replacement.
 *
 * @param  {!Node}              target          The target to replace.
 * @param  {!Array<!Node>}      replacement     The replacement.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const replaceNode = function (target, replacement, domFacade, documentWriter) {
	// The parent must exist or an error has been raised.
	const parent = (/** @type {!Node} */ (domFacade.getParentNode(target)));

	if (target.nodeType === ATTRIBUTE_NODE) {
		// All replacement must consist of attribute nodes.
		if (replacement.some(candidate => candidate.nodeType !== ATTRIBUTE_NODE)) {
			throw new Error('Constraint "If $target is an attribute node, $replacement must consist of zero or more attribute nodes." failed.');
		}

		const element = /** @type {!Element} */(parent);

		documentWriter.removeAttributeNS(element, target.namespaceURI, target.name);
		replacement.forEach(attr => {
			if (domFacade.getAttribute(element, attr.name)) {
				throw errXUDY0021(`An attribute ${attr.name} already exists.`);
			}
			documentWriter.setAttributeNS(element, attr.namespaceURI, attr.name, attr.value);
		});
	}

	if (target.nodeType === ELEMENT_NODE ||
		target.nodeType === TEXT_NODE ||
		target.nodeType === COMMENT_NODE ||
		target.nodeType === PROCESSING_INSTRUCTION_NODE) {
		const following = domFacade.getNextSibling(target);
		documentWriter.removeChild(parent, target);
		replacement.forEach(newNode => {
			documentWriter.insertBefore(parent, newNode, following);
		});
	}
};

/**
 * Replaces the string value of $target with $string-value.
 *
 * @param  {!Node}              target          The target to replace.
 * @param  {!string}            stringValue     The replacement.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const replaceValue = function (target, stringValue, domFacade, documentWriter) {
	if (target.nodeType === ATTRIBUTE_NODE) {
		const element = /** @type {!Element} */(domFacade.getParentNode(target));
		if (element) {
			documentWriter.setAttributeNS(element, target.namespaceURI, target.name, stringValue);
		} else {
			target.value = stringValue;
		}
	} else {
		documentWriter.setData(target, stringValue);
	}
};
