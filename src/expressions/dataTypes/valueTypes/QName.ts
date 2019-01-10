class QName {
	namespaceURI: string;
	prefix: string;
	localName: string;

	/**
	 * @param  prefix         The prefix of the QName, empty string if absent
	 * @param  namespaceURI   The namespaceURI of the QName, empty string if absent
	 * @param  localName      The localName of the QName, contains no colons
	 */
	constructor(prefix: string, namespaceURI: string | null, localName: string) {
		this.namespaceURI = namespaceURI || null;
		this.prefix = prefix || '';
		this.localName = localName;
	}

	buildPrefixedName?() {
		return this.prefix ? this.prefix + ':' + this.localName : this.localName;
	}
}

export default QName;
