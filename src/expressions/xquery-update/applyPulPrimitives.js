/**
 * Replaces $target with $replacement.
 *
 * @param  {!Node}              target          The target to replace.
 * @param  {!Array<?Node>}      replacement     The replacement.
 * @param  {?IDomFacade=}       domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}  documentWriter  The documentWriter for writing changes.
 */
export const replaceNode = function (target, replacement, domFacade, documentWriter) {
	const parent = (/** @type {!Node} */ (domFacade.getParentNode(target)));
	if (!parent) {
		// We only have to change the parent property.
		return;
	}

	if (target.nodeType === target.ATTRIBUTE_NODE) {
		// All replacement must consist of attribute nodes.
		if (replacement.some(candidate => candidate.nodeType !== candidate.ATTRIBUTE_NODE)) {
			throw new Error('Constraint "If $target is an attribute node, $replacement must consist of zero or more attribute nodes." failed.');
		}

		documentWriter.removeAttributeNS(parent, target.namespaceURI, target.name);
		replacement.forEach(attr => {
			documentWriter.setAttributeNS(parent, attr.namespaceURI, attr.name, attr.value);
		});
	}

	if (target.nodeType === target.ELEMENT_NODE ||
		target.nodeType === target.TEXT_NODE ||
		target.nodeType === target.COMMENT_NODE ||
		target.nodeType === target.PROCESSING_INSTRUCTION_NODE) {
		const following = domFacade.getNextSibling(target);
		documentWriter.removeChild(parent, target);
		replacement.forEach(newNode => {
			documentWriter.insertBefore(parent, newNode, following);
		});
	}
};
