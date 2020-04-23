import {
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
} from '../../../domClone/Pointer';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	public readonly target: ElementNodePointer | DocumentNodePointer;
	public readonly type: 'insertIntoAsFirst';
	constructor(target: ElementNodePointer | DocumentNodePointer, content: ChildNodePointer[]) {
		super(target, content, 'insertIntoAsFirst');
	}
}
