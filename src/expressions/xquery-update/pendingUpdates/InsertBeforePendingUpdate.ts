import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertBeforePendingUpdate extends InsertPendingUpdate {
	public readonly type: 'insertBefore';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertBefore');
	}
}
