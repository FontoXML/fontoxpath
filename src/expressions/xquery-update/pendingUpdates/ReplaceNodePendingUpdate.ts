import { ConcreteAttributeNode, ConcreteChildNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceNodePendingUpdate extends IPendingUpdate {
	constructor(
		readonly target: ConcreteAttributeNode | ConcreteChildNode,
		readonly replacement: (ConcreteAttributeNode | ConcreteChildNode)[]
	) {
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
