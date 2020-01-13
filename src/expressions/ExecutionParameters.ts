import IDocumentWriter from '../documentWriter/IDocumentWriter';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';
import INodesFactory from '../nodesFactory/INodesFactory';

export default class ExecutionParameters {
	constructor(
		public readonly domFacade: IWrappingDomFacade,
		public readonly nodesFactory: INodesFactory,
		public readonly documentWriter: IDocumentWriter,
		public readonly currentContext: any,
		public readonly logOutput?: (message: string) => void
	) {}
}
