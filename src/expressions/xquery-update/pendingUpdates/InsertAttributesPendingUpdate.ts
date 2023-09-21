import { AttributeNodePointer, ElementNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';

export class InsertAttributesPendingUpdate extends IPendingUpdate {
	public readonly type: 'insertAttributes';
	constructor(
		readonly target: ElementNodePointer,
		readonly content: AttributeNodePointer[],
	) {
		super('insertAttributes');
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			content: this.content.map((pointer) => realizeDom(pointer, executionParameters, true)),
		};
	}
}
