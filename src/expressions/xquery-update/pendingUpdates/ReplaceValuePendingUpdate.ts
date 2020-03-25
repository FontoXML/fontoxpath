import { ConcreteAttributeNode, ConcreteElementNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceValuePendingUpdate extends IPendingUpdate {
	public readonly type: 'replaceValue';
	constructor(
		readonly target: ConcreteElementNode | ConcreteAttributeNode,
		readonly stringValue: string
	) {
		super('replaceValue');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['string-value']: this.stringValue,
		};
	}
}
