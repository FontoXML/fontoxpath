import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
import { Attr } from '../../../types/Types';

export class InsertAttributesPendingUpdate extends IPendingUpdate {
	public readonly type: 'insertAttributes';
	constructor(readonly target: ConcreteNode, readonly content: Attr[]) {
		super('insertAttributes');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			content: this.content
		};
	}
}
