import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertAfterPendingUpdate extends InsertPendingUpdate {
	public readonly type: 'insertAfter';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertAfter');
	}
}
