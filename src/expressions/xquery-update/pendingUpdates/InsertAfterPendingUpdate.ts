import { ChildNodePointer } from '../../../domClone/Pointer';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertAfterPendingUpdate extends InsertPendingUpdate {
	public readonly target: ChildNodePointer;
	public readonly type: 'insertAfter';
	constructor(target: ChildNodePointer, content: ChildNodePointer[]) {
		super(target, content, 'insertAfter');
	}
}
