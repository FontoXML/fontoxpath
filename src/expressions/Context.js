/**
* @typedef {{localName: string, namespaceURI: string, arity: number, returnType: string, argumentTypes: !Array<string>, callFunction: !Function}}
*/
let FunctionDefinition;

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
	 * @return {FunctionDefinition|null}
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
