import QName from '../dataTypes/valueTypes/QName';
import ConcreteNode from 'src/domFacade/ConcreteNode';

abstract class PendingUpdate {
	public readonly target: ConcreteNode;
	constructor(public type: string) {}

	static fromTransferable(transferable: object) {
		switch (transferable['type']) {
			case 'delete':
				return new DeletePendingUpdate(transferable['target']);
			case 'insertAfter':
				return new InsertAfterPendingUpdate(
					transferable['target'],
					transferable['content']
				);
			case 'insertBefore':
				return new InsertBeforePendingUpdate(
					transferable['target'],
					transferable['content']
				);
			case 'insertInto':
				return new InsertIntoPendingUpdate(transferable['target'], transferable['content']);
			case 'insertIntoAsFirst':
				return new InsertIntoAsFirstPendingUpdate(
					transferable['target'],
					transferable['content']
				);
			case 'insertIntoAsLast':
				return new InsertIntoAsLastPendingUpdate(
					transferable['target'],
					transferable['content']
				);
			case 'insertAttributes':
				return new InsertAttributesPendingUpdate(
					transferable['target'],
					transferable['content']
				);
			case 'rename':
				return new RenamePendingUpdate(transferable['target'], transferable['newName']);
			case 'replaceNode':
				return new ReplaceNodePendingUpdate(
					transferable['target'],
					transferable['replacement']
				);
			case 'replaceValue':
				return new ReplaceValuePendingUpdate(
					transferable['target'],
					transferable['string-value']
				);
			case 'replaceElementContent':
				return new ReplaceElementContentPendingUpdate(
					transferable['target'],
					transferable['text']
				);
			default:
				throw new Error(
					`Unexpected type "${
						transferable['type']
					}" when parsing a transferable pending update.`
				);
		}
	}
	abstract toTransferable(): { type: string };
}
class DeletePendingUpdate extends PendingUpdate {
	readonly type: 'delete';
	constructor(readonly target: ConcreteNode) {
		super('delete');
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target
		};
	}
}

class InsertPendingUpdate extends PendingUpdate {
	constructor(readonly target: ConcreteNode, readonly content: ConcreteNode[], type: string) {
		super(type);
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['content']: this.content
		};
	}
}

class InsertAfterPendingUpdate extends InsertPendingUpdate {
	readonly type: 'insertAfter';

	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertAfter');
	}
}

class InsertBeforePendingUpdate extends InsertPendingUpdate {
	readonly type: 'insertBefore';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertBefore');
	}
}

class InsertIntoPendingUpdate extends InsertPendingUpdate {
	readonly type: 'insertInto';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertInto');
	}
}

class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	readonly type: 'insertIntoAsFirst';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertIntoAsFirst');
	}
}

class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	readonly type: 'insertIntoAsLast';
	constructor(target: ConcreteNode, content: ConcreteNode[]) {
		super(target, content, 'insertIntoAsLast');
	}
}

class InsertAttributesPendingUpdate extends PendingUpdate {
	readonly type: 'insertAttributes';
	constructor(readonly target: ConcreteNode, readonly content: Attr[]) {
		super('insertAttributes');
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			content: this.content
		};
	}
}

class RenamePendingUpdate extends PendingUpdate {
	readonly type: 'rename';
	newName: QName;
	constructor(readonly target: ConcreteNode, newName: QName) {
		super('rename');

		this.newName = newName.buildPrefixedName
			? newName
			: new QName(newName.prefix, newName.namespaceURI, newName.localName);
	}

	toTransferable() {
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

class ReplaceNodePendingUpdate extends PendingUpdate {
	constructor(readonly target: ConcreteNode, readonly replacement: ConcreteNode[]) {
		super('replaceNode');
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['replacement']: this.replacement
		};
	}
}

class ReplaceValuePendingUpdate extends PendingUpdate {
	readonly type: 'replaceValue';
	constructor(readonly target: ConcreteNode, readonly stringValue: string) {
		super('replaceValue');
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target
		};
	}
}

class ReplaceElementContentPendingUpdate extends PendingUpdate {
	readonly type: 'replaceElementContent';
	constructor(readonly target: ConcreteNode, readonly text: Text) {
		super('replaceElementContent');
	}

	toTransferable() {
		return {
			['type']: this.type,
			['target']: this.target,
			['text']: this.text
		};
	}
}

export {
	PendingUpdate,
	DeletePendingUpdate,
	InsertAfterPendingUpdate,
	InsertBeforePendingUpdate,
	InsertIntoPendingUpdate,
	InsertIntoAsFirstPendingUpdate,
	InsertIntoAsLastPendingUpdate,
	InsertAttributesPendingUpdate,
	RenamePendingUpdate,
	ReplaceElementContentPendingUpdate,
	ReplaceValuePendingUpdate,
	ReplaceNodePendingUpdate
};
