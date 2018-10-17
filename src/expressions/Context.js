/**
 * The common interface for StaticContext and ExecutionContext
 *
 * @interface
 */
export default class Context {
	constructor () {}
	/**
	 * @param  {string}       namespaceURI
	 * @param  {string}       localName
	 * @param  {number}       arity
	 * @return {Object|null}
	 */
	lookupFunction (namespaceURI, localName, arity) {}
	/**
	 * @param  {string}  prefix
	 * @return {?string}
	 */
	resolveNamespace (prefix) {}
	/**
	 * @param  {string|null}  namespaceURI
	 * @param  {string}       localName
	 * @return {string|null}
	 */
	lookupVariable (namespaceURI, localName) {}
}
