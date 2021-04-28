import domBackedDocumentWriter from './documentWriter/domBackedDocumentWriter';
import IDocumentWriter from './documentWriter/IDocumentWriter';
import wrapExternalDocumentWriter from './documentWriter/wrapExternalDocumentWriter';
import DomFacade from './domFacade/DomFacade';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import IDomFacade from './domFacade/IDomFacade';
import createPendingUpdateFromTransferable from './expressions/xquery-update/createPendingUpdateFromTransferable';
import { applyUpdates } from './expressions/xquery-update/pulRoutines';
import INodesFactory from './nodesFactory/INodesFactory';
import wrapExternalNodesFactory from './nodesFactory/wrapExternalNodesFactory';

/**
 * @public
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
	const newDomFacade = new DomFacade(domFacade ? domFacade : new ExternalDomFacade());

	documentWriter = documentWriter
		? wrapExternalDocumentWriter(documentWriter)
		: domBackedDocumentWriter;

	nodesFactory = nodesFactory ? (nodesFactory = wrapExternalNodesFactory(nodesFactory)) : null;

	const pul = pendingUpdateList.map(createPendingUpdateFromTransferable);
	applyUpdates(pul, null, null, newDomFacade, nodesFactory, documentWriter);
}
