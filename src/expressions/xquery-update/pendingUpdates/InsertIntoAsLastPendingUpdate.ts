import {
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteElementNode
} from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	public readonly target: ConcreteElementNode | ConcreteDocumentNode;
	public readonly type: 'insertIntoAsLast';
	constructor(target: ConcreteElementNode | ConcreteDocumentNode, content: ConcreteChildNode[]) {
		super(target, content, 'insertIntoAsLast');
	}
}
