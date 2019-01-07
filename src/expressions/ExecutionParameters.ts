import IDomFacade from '../domFacade/IDomFacade';
import INodesFactory from '../nodesFactory/INodesFactory';
import IDocumentWriter from '../documentWriter/IDocumentWriter';

export default class ExecutionParameters {
	domFacade: IDomFacade;
	nodesFactory: INodesFactory;
	documentWriter: IDocumentWriter;

	constructor (domFacade, nodesFactory, documentWriter) {
		this.domFacade = domFacade;
		this.nodesFactory = nodesFactory;
		this.documentWriter = documentWriter;
	}
}
