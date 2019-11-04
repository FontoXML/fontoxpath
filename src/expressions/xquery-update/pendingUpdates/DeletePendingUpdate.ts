import { ConcreteAttributeNode, ConcreteChildNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class DeletePendingUpdate extends IPendingUpdate {
	public readonly type: 'delete';
	constructor(readonly target: ConcreteAttributeNode | ConcreteChildNode) {
		super('delete');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target
		};
	}
}
