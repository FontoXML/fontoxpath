import { ConcreteNode } from '../../../domFacade/ConcreteNode';
import QName from '../../dataTypes/valueTypes/QName';
import { IPendingUpdate } from '../IPendingUpdate';
export class RenamePendingUpdate extends IPendingUpdate {
	public newName: QName;
	public readonly type: 'rename';
	constructor(readonly target: ConcreteNode, newName: QName) {
		super('rename');
		this.newName = newName.buildPrefixedName
			? newName
			: new QName(newName.prefix, newName.namespaceURI, newName.localName);
	}
	public toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['newName']: {
				['prefix']: this.newName.prefix,
				['namespaceURI']: this.newName.namespaceURI,
				['localName']: this.newName.localName
			}
		};
	}
}
