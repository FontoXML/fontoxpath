import { NodePointer } from '../../domClone/Pointer';
import ExecutionParameters from '../ExecutionParameters';

export abstract class IPendingUpdate {
	public readonly target: NodePointer;
	constructor(public type: string) {}

	public abstract toTransferable(executionParameters: ExecutionParameters): { type: string };
}
