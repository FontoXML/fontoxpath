import realizeDom from '../../../domClone/realizeDom';
import { ChildNodePointer, NodePointer } from '../../../domClone/Pointer';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';
export class InsertPendingUpdate extends IPendingUpdate {
	constructor(readonly target: NodePointer, readonly content: ChildNodePointer[], type: string) {
		super(type);
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			['content']: this.content.map((pointer) =>
				realizeDom(pointer, executionParameters, true)
			),
		};
	}
}
