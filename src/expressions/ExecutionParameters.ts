import IDocumentWriter from '../documentWriter/IDocumentWriter';
import IWrappingDomFacade from '../domFacade/IWrappingDomFacade';
import INodesFactory from '../nodesFactory/INodesFactory';
import { Logger } from '../evaluateXPath';

export default class ExecutionParameters {
	constructor(
		public readonly domFacade: IWrappingDomFacade,
		public readonly nodesFactory: INodesFactory,
		public readonly documentWriter: IDocumentWriter,
		public readonly currentContext: any,
		public readonly logger?: Logger
	) {}
}
