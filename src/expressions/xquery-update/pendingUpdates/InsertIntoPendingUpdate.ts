import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoPendingUpdate extends InsertPendingUpdate {
	public readonly type: 'insertInto';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertInto');
	}
}
