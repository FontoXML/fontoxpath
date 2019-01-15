import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceElementContentPendingUpdate extends IPendingUpdate {
	public readonly type: 'replaceElementContent';
	constructor(readonly target: ConcreteNode, readonly text: Text) {
		super('replaceElementContent');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['text']: this.text
		};
	}
}
