import QName from '../dataTypes/valueTypes/QName';

/**
 * @abstract
 */
abstract class PendingUpdate {
	type: string;
	constructor(type) {
		this.type = type;
	}

	abstract toTransferable(): object

	static fromTransferable(transferable) {
		switch (transferable['type']) {
			case 'delete':
				return new DeletePendingUpdate(transferable['target']);
			case 'insertAfter':
				return new InsertAfterPendingUpdate(transferable['target'], transferable['content']);
			case 'insertBefore':
				return new InsertBeforePendingUpdate(transferable['target'], transferable['content']);
			case 'insertInto':
				return new InsertIntoPendingUpdate(transferable['target'], transferable['content']);
			case 'insertIntoAsFirst':
				return new InsertIntoAsFirstPendingUpdate(transferable['target'], transferable['content']);
			case 'insertIntoAsLast':
				return new InsertIntoAsLastPendingUpdate(transferable['target'], transferable['content']);
			case 'insertAttributes':
				return new InsertAttributesPendingUpdate(transferable['target'], transferable['content']);
			case 'rename':
				return new RenamePendingUpdate(transferable['target'], transferable['newName']);
			case 'replaceNode':
				return new ReplaceNodePendingUpdate(transferable['target'], transferable['replacement']);
			case 'replaceValue':
				return new ReplaceValuePendingUpdate(transferable['target'], transferable['string-value']);
			case 'replaceElementContent':
				return new ReplaceElementContentPendingUpdate(transferable['target'], transferable['text']);
			default:
				throw new Error(`Unexpected type "${transferable['type']}" when parsing a transferable pending update.`);
		}
	};
}
class DeletePendingUpdate extends PendingUpdate {
	target: Node;
	constructor(target) {
		super('delete');

		this.target = target;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target
		};
	}
}

class InsertPendingUpdate extends PendingUpdate {
	target: Node;
	content: Node[];
	constructor(target, content, type) {
		super(type);
		this.target = target;
		this.content = content;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'content': this.content
		};
	}
}

class InsertAfterPendingUpdate extends InsertPendingUpdate {
	constructor(target, content) {
		super(target, content, 'insertAfter');
	}
}

class InsertBeforePendingUpdate extends InsertPendingUpdate {
	constructor(target, content) {
		super(target, content, 'insertBefore');
	}
}

class InsertIntoPendingUpdate extends InsertPendingUpdate {
	constructor(target, content) {
		super(target, content, 'insertInto');
	}
}

class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	constructor(target, content) {
		super(target, content, 'insertIntoAsFirst');
	}
}

class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	constructor(target, content) {
		super(target, content, 'insertIntoAsLast');
	}
}

class InsertAttributesPendingUpdate extends PendingUpdate {
	target: Node;
	content: Attr[];
	constructor(target, content) {
		super('insertAttributes');
		this.target = target;

		this.content = content;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'content': this.content
		};
	}
}

class RenamePendingUpdate extends PendingUpdate {
	target: Node;
	newName: QName;
	constructor(target, newName) {
		super('rename');
		this.target = target;

		this.newName = newName.buildPrefixedName ?
			newName :
			new QName(newName.prefix, newName.namespaceURI, newName.localName);
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'newName': {
				'prefix': this.newName.prefix,
				'namespaceURI': this.newName.namespaceURI,
				'localName': this.newName.localName
			}
		};
	}
}

class ReplaceNodePendingUpdate extends PendingUpdate {
	target: Node;
	replacement: any;
	constructor(target, replacement) {
		super('replaceNode');
		this.target = target;

		/**
		 * @type  {!Array<!Node>}
		 */
		this.replacement = replacement;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'replacement': this.replacement
		};
	}
}

class ReplaceValuePendingUpdate extends PendingUpdate {
	target: Node;
	stringValue: string;
	constructor(target, stringValue) {
		super('replaceValue');
		this.target = target;

		/**
		 * @type  {string}
		 */
		this.stringValue = stringValue;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'string-value': this.stringValue
		};
	}
}

class ReplaceElementContentPendingUpdate extends PendingUpdate {
	target: Node;
	text: Text;
	constructor(target, text) {
		super('replaceElementContent');
		this.target = target;
		/**
		 * @type {!Text}
		 */
		this.text = text;
	}

	toTransferable() {
		return {
			'type': this.type,
			'target': this.target,
			'text': this.text
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
