import {
	ConcreteChildNode,
	ConcreteDocumentNode,
	ConcreteElementNode,
} from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	public readonly target: ConcreteElementNode | ConcreteDocumentNode;
	public readonly type: 'insertIntoAsFirst';
	constructor(target: ConcreteElementNode | ConcreteDocumentNode, content: ConcreteChildNode[]) {
		super(target, content, 'insertIntoAsFirst');
	}
}
