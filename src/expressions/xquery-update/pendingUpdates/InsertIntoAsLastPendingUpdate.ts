import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	public readonly type: 'insertIntoAsLast';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertIntoAsLast');
	}
}
