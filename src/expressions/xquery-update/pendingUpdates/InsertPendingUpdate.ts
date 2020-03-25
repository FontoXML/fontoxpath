import { ConcreteChildNode, ConcreteNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class InsertPendingUpdate extends IPendingUpdate {
	constructor(
		readonly target: ConcreteNode,
		readonly content: ConcreteChildNode[],
		type: string
	) {
		super(type);
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['content']: this.content,
		};
	}
}
