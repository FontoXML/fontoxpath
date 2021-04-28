class QName {
	public localName: string;
	public namespaceURI: string;
	public prefix: string;

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

	public buildPrefixedName?() {
		return this.prefix ? this.prefix + ':' + this.localName : this.localName;
	}
}

export default QName;
