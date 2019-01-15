import domBackedDomFacade from './domFacade/domBackedDomFacade';
import DomFacade from './domFacade/DomFacade';
import IDomFacade from './domFacade/IDomFacade';

import domBackedDocumentWriter from './documentWriter/domBackedDocumentWriter';
import IDocumentWriter from './documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from './documentWriter/wrapExternalDocumentWriter';

import INodesFactory from './nodesFactory/INodesFactory';
import wrapExternalNodesFactory from './nodesFactory/wrapExternalNodesFactory';

import { applyUpdates } from './expressions/xquery-update/pulRoutines';

import createPendingUpdateFromTransferable from './expressions/xquery-update/createPendingUpdateFromTransferable';

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  pendingUpdateList - The updateScript to execute.
 * @param  domFacade         - The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  nodesFactory      - The nodesFactory for creating nodes.
 * @param  documentWriter    - The documentWriter for writing changes.
 */
export default function executePendingUpdateList(
	pendingUpdateList: object[],
	domFacade?: IDomFacade,
	nodesFactory?: INodesFactory,
	documentWriter?: IDocumentWriter
): void {
	domFacade = domFacade ? new DomFacade(domFacade) : domBackedDomFacade;

	documentWriter = documentWriter
		? wrapExternalDocumentWriter(documentWriter)
		: domBackedDocumentWriter;

	nodesFactory = nodesFactory ? (nodesFactory = wrapExternalNodesFactory(nodesFactory)) : null;

	const pul = pendingUpdateList.map(createPendingUpdateFromTransferable);
	applyUpdates(pul, null, null, domFacade, nodesFactory, documentWriter);
}
