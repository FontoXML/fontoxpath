import { NodePointer } from '../../domClone/Pointer';
import ExecutionParameters from '../ExecutionParameters';
import { TransferablePendingUpdate } from './createPendingUpdateFromTransferable';

export type PendingUpdateType =
	| 'delete'
	| 'insertAfter'
	| 'insertAttributes'
	| 'insertBefore'
	| 'insertInto'
	| 'insertIntoAsFirst'
	| 'insertIntoAsLast'
	| 'put'
	| 'rename'
	| 'replaceElementContent'
	| 'replaceNode'
	| 'replaceValue';

export abstract class IPendingUpdate {
	public readonly target: NodePointer;
	public readonly type: PendingUpdateType;
	constructor(public pendingUpdateType: PendingUpdateType) {
		this.type = pendingUpdateType;
	}

	public abstract toTransferable(
		executionParameters: ExecutionParameters
	): TransferablePendingUpdate;
}
