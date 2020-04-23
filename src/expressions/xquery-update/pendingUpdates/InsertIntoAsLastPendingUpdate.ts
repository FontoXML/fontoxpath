import {
	ChildNodePointer,
	DocumentNodePointer,
	ElementNodePointer,
} from '../../../domClone/Pointer';
import { InsertPendingUpdate } from './InsertPendingUpdate';
export class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	public readonly target: ElementNodePointer | DocumentNodePointer;
	public readonly type: 'insertIntoAsLast';
	constructor(target: ElementNodePointer | DocumentNodePointer, content: ChildNodePointer[]) {
		super(target, content, 'insertIntoAsLast');
	}
}
