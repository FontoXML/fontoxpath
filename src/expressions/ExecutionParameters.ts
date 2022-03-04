import IDocumentWriter from '../documentWriter/IDocumentWriter';
import { NodePointer, TinyNode } from '../domClone/Pointer';
import { ConcreteNode } from '../domFacade/ConcreteNode';
import DomFacade from '../domFacade/DomFacade';
import INodesFactory from '../nodesFactory/INodesFactory';
import { Logger } from '../types/Options';

export default class ExecutionParameters {
	constructor(
		public readonly debug: boolean,
		public readonly disableCache: boolean,
		public readonly domFacade: DomFacade,
		public readonly nodesFactory: INodesFactory,
		public readonly documentWriter: IDocumentWriter,
		public readonly currentContext: any,
		public readonly rootPointerByRootNodeMap: Map<ConcreteNode | TinyNode, NodePointer>,
		public readonly logger?: Logger,
		public readonly xmlSerializer?: XMLSerializer
	) {}
}
