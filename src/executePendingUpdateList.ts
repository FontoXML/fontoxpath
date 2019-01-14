import domBackedDomFacade from './domFacade/domBackedDomFacade';
import DomFacade from './domFacade/DomFacade';
import IDomFacade from './domFacade/IDomFacade';

import domBackedDocumentWriter from './documentWriter/domBackedDocumentWriter';
import IDocumentWriter from './documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from './documentWriter/wrapExternalDocumentWriter';

import INodesFactory from './nodesFactory/INodesFactory';
import wrapExternalNodesFactory from './nodesFactory/wrapExternalNodesFactory';

import { PendingUpdate } from './expressions/xquery-update/PendingUpdate';
import { applyUpdates } from './expressions/xquery-update/pulRoutines';

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  pendingUpdateList  The updateScript to execute.
 * @param  domFacade          The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  nodesFactory       The nodesFactory for creating nodes.
 * @param  documentWriter     The documentWriter for writing changes.
 */
export default function executePendingUpdateList(
	pendingUpdateList: object[],
	domFacade?: IDomFacade,
	nodesFactory?: INodesFactory,
	documentWriter?: IDocumentWriter
): void {
	if (domFacade) {
		domFacade = new DomFacade(domFacade);
	} else {
		domFacade = domBackedDomFacade;
	}

	if (documentWriter) {
		documentWriter = wrapExternalDocumentWriter(documentWriter);
	} else {
		documentWriter = domBackedDocumentWriter;
	}

	if (nodesFactory) {
		nodesFactory = wrapExternalNodesFactory(nodesFactory);
	} else {
		nodesFactory = null;
	}

	const pul = pendingUpdateList.map(PendingUpdate.fromTransferable);
	applyUpdates(pul, null, null, domFacade, nodesFactory, documentWriter);
}
