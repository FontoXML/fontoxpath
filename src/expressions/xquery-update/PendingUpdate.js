import QName from '../dataTypes/valueTypes/QName';

/**
 * @abstract
 */
class PendingUpdate {
	constructor (type) {
		/**
		 * @type   {string}
		 */
		this.type = type;
	}

	/**
	 * @abstract
	 * @return {Object}
	 */
	toTransferable () {
	}
}

PendingUpdate.fromTransferable = function (transferable) {
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

class DeletePendingUpdate extends PendingUpdate {
	constructor (target) {
		super('delete');

		/**
		 * @type   {!Node}
		 */
		this.target = target;
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target
		};
	}
}

class InsertPendingUpdate extends PendingUpdate {
	constructor (target, content, type) {
		super(type);

		/**
		 * @type   {!Node}
		 */
		this.target = target;

		/**
		 * @type  {!Array<!Node>}
		 */
		this.content = content;
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target,
			'content': this.content
		};
	}
}

class InsertAfterPendingUpdate extends InsertPendingUpdate {
	constructor (target, content) {
		super(target, content, 'insertAfter');
	}
}

class InsertBeforePendingUpdate extends InsertPendingUpdate {
	constructor (target, content) {
		super(target, content, 'insertBefore');
	}
}

class InsertIntoPendingUpdate extends InsertPendingUpdate {
	constructor (target, content) {
		super(target, content, 'insertInto');
	}
}

class InsertIntoAsFirstPendingUpdate extends InsertPendingUpdate {
	constructor (target, content) {
		super(target, content, 'insertIntoAsFirst');
	}
}

class InsertIntoAsLastPendingUpdate extends InsertPendingUpdate {
	constructor (target, content) {
		super(target, content, 'insertIntoAsLast');
	}
}

class InsertAttributesPendingUpdate extends PendingUpdate {
	constructor (target, content) {
		super('insertAttributes');

		/**
		 * @type   {!Element}
		 */
		this.target = target;

		/**
		 * @type  {!Array<!Attr>}
		 */
		this.content = content;
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target,
			'content': this.content
		};
	}
}

class RenamePendingUpdate extends PendingUpdate {
	constructor (target, newName) {
		super('rename');

		/**
		 * @type   {!Node}
		 */
		this.target = target;

		/**
		 * @type  {!QName}
		 */
		this.newName = newName.buildPrefixedName ?
			newName :
			new QName(newName.prefix, newName.namespaceURI, newName.localPart);
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target,
			'newName': {
				'prefix': this.newName.prefix,
				'namespaceURI': this.newName.namespaceURI,
				'localPart': this.newName.localPart
			}
		};
	}
}

class ReplaceNodePendingUpdate extends PendingUpdate {
	constructor (target, replacement) {
		super('replaceNode');

		/**
		 * @type   {!Node}
		 */
		this.target = target;

		/**
		 * @type  {!Array<!Node>}
		 */
		this.replacement = replacement;
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target,
			'replacement': this.replacement
		};
	}
}

class ReplaceValuePendingUpdate extends PendingUpdate {
	constructor (target, stringValue) {
		super('replaceValue');

		/**
		 * @type   {!Node}
		 */
		this.target = target;

		/**
		 * @type  {string}
		 */
		this.stringValue = stringValue;
	}

	toTransferable () {
		return {
			'type': this.type,
			'target': this.target,
			'string-value': this.stringValue
		};
	}
}

class ReplaceElementContentPendingUpdate extends PendingUpdate {
	constructor (target, text) {
		super('replaceElementContent');
		/**
		 * @type   {!Node}
		 */
		this.target = target;
		/**
		 * @type {!Text}
		 */
		this.text = text;
	}

	toTransferable () {
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
