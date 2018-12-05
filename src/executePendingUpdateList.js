import DomFacade from './DomFacade';
import domBackedDomFacade from './domBackedDomFacade';
import domBackedDocumentWriter from './domBackedDocumentWriter';
import { applyUpdates } from './expressions/xquery-update/pulRoutines';
import { PendingUpdate } from './expressions/xquery-update/PendingUpdate';

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!Array<!Object>}    pendingUpdateList  The updateScript to execute.
 * @param  {?IDomFacade=}       domFacade          The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?INodesFactory=}    nodesFactory       The nodesFactory for creating nodes.
 * @param  {?IDocumentWriter=}  documentWriter     The documentWriter for writing changes.
 */
export default function executePendingUpdateList (pendingUpdateList, domFacade, nodesFactory, documentWriter) {
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}

	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	if (!documentWriter) {
		documentWriter = domBackedDocumentWriter;
	}

	const pul = pendingUpdateList.map(PendingUpdate.fromTransferable);
	applyUpdates(pul, null, null, wrappedDomFacade, nodesFactory, documentWriter);
}
