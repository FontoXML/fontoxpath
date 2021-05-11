import { ChildNodePointer, ParentNodePointer } from '../../../domClone/Pointer';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertBeforePendingUpdate extends InsertPendingUpdate {
	public readonly target: ChildNodePointer;
	public readonly type: 'insertBefore';
	constructor(target: ParentNodePointer, content: ChildNodePointer[]) {
		super(target, content, 'insertBefore');
	}
}
