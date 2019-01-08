class QName {
	namespaceURI: string;
	prefix: string;
	localPart: string;
	/**
	 * @param  prefix         The prefix of the QName, empty string if absent
	 * @param  namespaceURI   The namespaceURI of the QName, empty string if absent
	 * @param  localPart      The localPart of the QName, contains no colons
	 */
	constructor (prefix: string, namespaceURI: string | null, localPart: string) {
		this.namespaceURI = namespaceURI || null;
		this.prefix = prefix || '';
		this.localPart = localPart;
	}

	buildPrefixedName () {
		return this.prefix ? this.prefix + ':' + this.localPart : this.localPart;
	}
}

export default QName;
