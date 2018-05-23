/**
 * The common interface for StaticContext and ExecutionContext
 *
 * @interface
 */
export default class Context {
	constructor () {}
	lookupFunction (namespaceURI, localName, arity) {}
	resolveNamespace (prefix) {}
	lookupVariable (namespaceURI, localName) {}
}
