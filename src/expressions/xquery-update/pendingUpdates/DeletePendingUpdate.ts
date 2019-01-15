import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class DeletePendingUpdate extends IPendingUpdate {
	public readonly type: 'delete';
	constructor(readonly target: ConcreteNode) {
		super('delete');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target
		};
	}
}
