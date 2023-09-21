import { ElementNodePointer, TextNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import { IPendingUpdate } from '../IPendingUpdate';

export class ReplaceElementContentPendingUpdate extends IPendingUpdate {
	public readonly type: 'replaceElementContent';
	constructor(
		readonly target: ElementNodePointer,
		readonly text: TextNodePointer | null,
	) {
		super('replaceElementContent');
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			['text']: this.text ? realizeDom(this.text, executionParameters, true) : null,
		};
	}
}
