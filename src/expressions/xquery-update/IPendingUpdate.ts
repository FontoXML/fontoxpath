import { NodePointer } from '../../domClone/Pointer';
import ExecutionParameters from '../ExecutionParameters';
import { TransferablePendingUpdate } from './createPendingUpdateFromTransferable';

export abstract class IPendingUpdate {
	public readonly target: NodePointer;
	constructor(public type: string) {}

	public abstract toTransferable(
		executionParameters: ExecutionParameters
	): TransferablePendingUpdate;
}
