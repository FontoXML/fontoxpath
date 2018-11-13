import DomFacade from './DomFacade';
import domBackedDomFacade from './domBackedDomFacade';
import domBackedDocumentWriter from './domBackedDocumentWriter';
import { PendingUpdate } from './expressions/xquery-update/PendingUpdate';

const ATTRIBUTE_NODE = 2;

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!Array<!Object>}  pendingUpdates  The updateScript to execute.
 * @param  {?IDomFacade=}            domFacade       The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?IDocumentWriter=}       documentWriter  Extra options for evaluating this XPath
 */
export default function executePendingUpdateList (pendingUpdates, domFacade, documentWriter) {
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}

	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	if (!documentWriter) {
		documentWriter = domBackedDocumentWriter;
	}

	pendingUpdates.forEach(transferableUpdate => {
		const pendingUpdate = PendingUpdate.fromTransferable(transferableUpdate);
		switch (pendingUpdate.type) {
			case 'replaceElementContent': {
				domFacade.getChildNodes(pendingUpdate.target).forEach(node => documentWriter.removeChild(pendingUpdate.target, node));
				if (pendingUpdate.text) {
					documentWriter.insertBefore(pendingUpdate.target, pendingUpdate.text, null);
				}
				break;
			}
			case 'replaceNode': {
				const parent = (/** @type {!Node} */ (wrappedDomFacade.getParentNode(pendingUpdate.target)));
				const following = wrappedDomFacade.getNextSibling(pendingUpdate.target);
				documentWriter.removeChild(parent, pendingUpdate.target);
				pendingUpdate.replacement.forEach(newNode => {
					documentWriter.insertBefore(parent, newNode, following);
				});
				break;
			}
			case 'replaceValue': {
				if (pendingUpdate.target.nodeType === ATTRIBUTE_NODE) {
					const attribute = pendingUpdate.target;
					documentWriter.setAttributeNS(
						attribute.ownerElement,
						attribute.namespaceURI,
						attribute.name,
						pendingUpdate.stringValue);
				}
				else {
					documentWriter.setData(pendingUpdate.target, pendingUpdate.stringValue);
				}
				break;
			}
			default:
				throw new Error('Not implemented: the execution for pendingUpdate ' + pendingUpdate.type + ' is not yet implemented.');
		}
	});
}
