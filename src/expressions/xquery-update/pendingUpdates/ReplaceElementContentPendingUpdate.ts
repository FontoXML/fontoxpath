import { ConcreteElementNode } from '../../../domFacade/ConcreteNode';
import { Text } from '../../../types/Types';
import { IPendingUpdate } from '../IPendingUpdate';

export class ReplaceElementContentPendingUpdate extends IPendingUpdate {
	public readonly type: 'replaceElementContent';
	constructor(readonly target: ConcreteElementNode, readonly text: Text) {
		super('replaceElementContent');
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['text']: this.text,
		};
	}
}
