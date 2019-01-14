export default interface Context {
	/**
	 * @param  {string}       namespaceURI
	 * @param  {string}       localName
	 * @param  {number}       arity
	 * @return {Object|null}
	 */
	lookupFunction(namespaceURI: string, localName: string, arity: number): object | null;
	/**
	 * @param  {string|null}  namespaceURI
	 * @param  {string}       localName
	 * @return {string|null}
	 */

	lookupVariable(namespaceURI: string | null, localName: string): string | null;

	/**
	 * @param  {string}  prefix
	 * @return {?string}
	 */

	resolveNamespace(prefix: string): string | null;
}
