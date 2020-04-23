import {
	AttributeNodePointer,
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
} from '../../../domClone/Pointer';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoPendingUpdate extends InsertPendingUpdate {
	public readonly target: ElementNodePointer | DocumentNodePointer;
	public readonly type: 'insertInto';
	constructor(target: ElementNodePointer, content: (AttributeNodePointer | ChildNodePointer)[]) {
		super(target, content, 'insertInto');
	}
}
