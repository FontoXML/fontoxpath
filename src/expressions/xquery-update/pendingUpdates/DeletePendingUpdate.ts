import realizeDom from '../../../domClone/realizeDom';
import { AttributeNodePointer, ChildNodePointer } from '../../../domClone/Pointer';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';
export class DeletePendingUpdate extends IPendingUpdate {
	public readonly type: 'delete';
	constructor(readonly target: AttributeNodePointer | ChildNodePointer) {
		super('delete');
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
		};
	}
}
