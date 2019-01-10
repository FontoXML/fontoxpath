import INodesFactory from '../nodesFactory/INodesFactory';
import IDocumentWriter from '../documentWriter/IDocumentWriter';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';

export default class ExecutionParameters {
	constructor(
		public readonly domFacade: IWrappingDomFacade,
		public readonly nodesFactory: INodesFactory,
		public readonly documentWriter: IDocumentWriter
	) {}
}
