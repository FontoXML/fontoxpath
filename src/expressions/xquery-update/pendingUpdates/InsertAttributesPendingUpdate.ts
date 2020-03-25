import { ConcreteElementNode } from '../../../domFacade/ConcreteNode';
import { Attr } from '../../../types/Types';
import { IPendingUpdate } from '../IPendingUpdate';

export class InsertAttributesPendingUpdate extends IPendingUpdate {
	public readonly type: 'insertAttributes';
	constructor(readonly target: ConcreteElementNode, readonly content: Attr[]) {
		super('insertAttributes');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			content: this.content,
		};
	}
}
