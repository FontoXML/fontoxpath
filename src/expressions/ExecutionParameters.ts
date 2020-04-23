import IDocumentWriter from '../documentWriter/IDocumentWriter';
import DomFacade from '../domFacade/DomFacade';
import INodesFactory from '../nodesFactory/INodesFactory';
import { Logger } from '../evaluateXPath';
import { NodePointer } from '../domClone/Pointer';

export default class ExecutionParameters {
	constructor(
		public readonly domFacade: DomFacade,
		public readonly nodesFactory: INodesFactory,
		public readonly documentWriter: IDocumentWriter,
		public readonly currentContext: any,
		public readonly rootPointerByDescendantPointerMap: Map<NodePointer, NodePointer>,
		public readonly logger?: Logger
	) {}
}
