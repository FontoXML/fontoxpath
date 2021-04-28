import { ElementNodePointer } from '../../../domClone/Pointer';
import realizeDom from '../../../domClone/realizeDom';
import ExecutionParameters from '../../../expressions/ExecutionParameters';
import QName from '../../dataTypes/valueTypes/QName';
import { IPendingUpdate } from '../IPendingUpdate';
export class RenamePendingUpdate extends IPendingUpdate {
	public newName: QName;
	public readonly type: 'rename';
	constructor(readonly target: ElementNodePointer, newName: QName) {
		super('rename');
		this.newName = newName.buildPrefixedName
			? newName
			: new QName(newName.prefix, newName.namespaceURI, newName.localName);
	}
	public toTransferable(executionParameters: ExecutionParameters) {
		return {
			['type']: this.type,
			['target']: realizeDom(this.target, executionParameters, false),
			['newName']: {
				['prefix']: this.newName.prefix,
				['namespaceURI']: this.newName.namespaceURI,
				['localName']: this.newName.localName,
			},
		};
	}
}
