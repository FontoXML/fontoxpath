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
	ReplaceElementContentPendingUpdate,
	ReplaceValuePendingUpdate,
	ReplaceNodePendingUpdate
};
