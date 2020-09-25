import { AttributeNodePointer, ChildNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceNodePendingUpdate extends IPendingUpdate {
	constructor(
		readonly target: AttributeNodePointer | ChildNodePointer,
		readonly replacement: (AttributeNodePointer | ChildNodePointer)[]
	) {
		super('replaceNode');
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			['replacement']: this.replacement.map((pointer) =>
				realizeDom(pointer, executionParameters, true)
			),
		};
	}
}
