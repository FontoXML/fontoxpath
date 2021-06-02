import { AttributeNodePointer, ChildNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { TransferablePendingUpdate } from '../createPendingUpdateFromTransferable';
import { IPendingUpdate } from '../IPendingUpdate';
export class DeletePendingUpdate extends IPendingUpdate {
	public readonly type: 'delete';
	constructor(readonly target: AttributeNodePointer | ChildNodePointer) {
		super('delete');
	}
	public toTransferable(executionParameters: ExecutionParameters): TransferablePendingUpdate {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
		};
	}
}
