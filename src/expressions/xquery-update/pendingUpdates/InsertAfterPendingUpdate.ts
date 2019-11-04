import { ConcreteChildNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertAfterPendingUpdate extends InsertPendingUpdate {
	public readonly target: ConcreteChildNode;
	public readonly type: 'insertAfter';
	constructor(target: ConcreteChildNode, content: ConcreteChildNode[]) {
		super(target, content, 'insertAfter');
	}
}
