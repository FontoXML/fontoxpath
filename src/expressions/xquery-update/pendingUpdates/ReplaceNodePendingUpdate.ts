import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceNodePendingUpdate extends IPendingUpdate {
	constructor(readonly target: ConcreteNode, readonly replacement: ConcreteNode[]) {
		super('replaceNode');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['replacement']: this.replacement
		};
	}
}
