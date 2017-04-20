class QName {
	constructor (namespaceName, localPart) {
		// TODO: Add lookup for namespace, throw FONS0004 if not found
		this._namespaceName = namespaceName;
		this._localPart = localPart;
	}

	static fromString (string) {
		const parts = string.split(':');

		if (parts.length < 1) {
			return new QName('', parts[0]);
		}

		return new QName(parts[0], parts[1]);
	}

	toString () {
		return (this._namespaceName === '' ? '' : this._namespaceName + ':') + this._localPart;
	}
}

export default QName;
