import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	public readonly type: 'insertIntoAsFirst';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertIntoAsFirst');
	}
}
