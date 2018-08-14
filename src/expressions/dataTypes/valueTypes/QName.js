class QName {
	/**
	 * @param  {string}   prefix         The prefix of the QName, empty string if absent
	 * @param  {?string}  namespaceURI   The namespaceURI of the QName, empty string if absent
	 * @param  {string}   localPart      The localPart of the QName, contains no colons
	 */
	constructor (prefix, namespaceURI, localPart) {
		this.namespaceURI = namespaceURI || null;
		this.prefix = prefix || '';
		this.localPart = localPart;
	}
}

export default QName;
