import { AttributeNodePointer, ElementNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';
export class ReplaceValuePendingUpdate extends IPendingUpdate {
	public readonly type: 'replaceValue';
	constructor(
		readonly target: ElementNodePointer | AttributeNodePointer,
		readonly stringValue: string,
	) {
		super('replaceValue');
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			['string-value']: this.stringValue,
		};
	}
}
