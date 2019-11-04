import {
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteElementNode
} from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertBeforePendingUpdate extends InsertPendingUpdate {
	public readonly target: ConcreteChildNode;
	public readonly type: 'insertBefore';
	constructor(target: ConcreteElementNode | ConcreteDocumentNode, content: ConcreteChildNode[]) {
		super(target, content, 'insertBefore');
	}
}
