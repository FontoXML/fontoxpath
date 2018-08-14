import Context from './Context';

function createHashKey (namespaceURI, localName) {
	return `Q{${namespaceURI || ''}}${localName}`;
}

function lookupInOverrides (overrides, key) {
	key = key + '';
	for (let i = overrides.length - 1; i >= 0; --i) {
		if (key in overrides[i]) {
			return overrides[i][key];
		}
	}

	return undefined;
}

/**
 * The static context consists of all information that is available at compile time: the globally
 * defined functions, locally defined functions, etc.
 *
 * It will be overlayed by itself, but overlays the execution context, since that may know of
 * namespaces or variables that are also available in a global scope, but only when the selector uses
 * none.
 *
 * @implements {Context}
 */
export default class StaticContext {
	constructor (parentContext) {
		/**
		 * @type {Context}
		 */
		this.parentContext = parentContext;

		this._scopeDepth = 0;
		this._scopeCount = 0;

		this._registeredNamespaceURIByPrefix = [Object.create(null)];
		this._registeredVariableBindingByHashKey = [Object.create(null)];

		// Functions may never be added for only a closure
		this._registeredFunctionsByHash = Object.create(null);
	}

	registerFunctionDefinition (namespaceURI, localName, arity, compileFunction) {
		// TODO
	}

	lookupFunction (namespaceURI, localName, arity) {
		return this.parentContext === null ? null : this.parentContext.lookupFunction(
			namespaceURI,
			localName,
			arity);
	}

	/**
	 * Register the _existence_ of a variable.
	 *
	 * We need this to separate variable declaration (which is required to be done statically) and
	 * from when the dynamic context of the variable will be known.
	 */
	registerVariable (namespaceURI, localName) {
		const hash = createHashKey(namespaceURI, localName);
		return this._registeredVariableBindingByHashKey[this._scopeDepth][hash] = `${hash}[${this._scopeCount}]`;
	}

	registerNamespace (prefix, namespaceURI) {
		this._registeredNamespaceURIByPrefix[this._scopeDepth][prefix] = namespaceURI;
	}

	lookupVariable (namespaceURI, localName) {
		const hash = createHashKey(namespaceURI, localName);
		const varNameInCurrentScope = lookupInOverrides(this._registeredVariableBindingByHashKey, hash);
		if (varNameInCurrentScope) {
			return varNameInCurrentScope;
		}
		return this.parentContext.lookupVariable(namespaceURI, localName);
	}

	introduceScope () {
		this._scopeCount++;
		this._scopeDepth++;

		this._registeredNamespaceURIByPrefix[this._scopeDepth] = Object.create(null);
		this._registeredVariableBindingByHashKey[this._scopeDepth] = Object.create(null);
	}

	removeScope () {
		this._registeredNamespaceURIByPrefix.length = this._scopeDepth;
		this._registeredVariableBindingByHashKey.length = this._scopeDepth;
		this._scopeDepth--;
	}

	resolveNamespace (prefix) {
		const uri = lookupInOverrides(this._registeredNamespaceURIByPrefix, prefix || '');
		if (uri === undefined) {
			return this.parentContext === null ? undefined : this.parentContext.resolveNamespace(prefix);
		}
		return uri;
	}

	/**
	 * Make a clone of this static context at the current scope that can be retained for later usage
	 * (such as dynamic namespace lookups)
	 *
	 * @return {StaticContext}
	 */
	cloneContext () {
		const contextAtThisPoint = new StaticContext(this.parentContext);
		for (var i = 0; i < this._scopeDepth + 1; ++i) {
			contextAtThisPoint._registeredNamespaceURIByPrefix = [Object.assign(
				Object.create(null),
				contextAtThisPoint._registeredNamespaceURIByPrefix[0],
				this._registeredNamespaceURIByPrefix[i])];
			contextAtThisPoint._registeredVariableBindingByHashKey = [Object.assign(
				Object.create(null),
				contextAtThisPoint._registeredVariableBindingByHashKey[0],
				this._registeredVariableBindingByHashKey[i])];
		}

		return contextAtThisPoint;
	}
}
