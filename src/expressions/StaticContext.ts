import Context from './Context';

function createHashKey(namespaceURI: any, localName: any) {
	return `Q{${namespaceURI || ''}}${localName}`;
}

function lookupInOverrides(overrides: any[] | { [x: string]: any }[], key: string) {
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
 */
export default class StaticContext {
	parentContext: Context;
	_scopeDepth: number;
	_scopeCount: number;
	_registeredNamespaceURIByPrefix: any[];
	_registeredVariableBindingByHashKey: any[];
	_registeredFunctionsByHash: any;

	constructor(parentContext: Context) {
		this.parentContext = parentContext;

		this._scopeDepth = 0;
		this._scopeCount = 0;

		this._registeredNamespaceURIByPrefix = [Object.create(null)];
		this._registeredVariableBindingByHashKey = [Object.create(null)];

		// Functions may never be added for only a closure
		this._registeredFunctionsByHash = Object.create(null);
	}

	registerFunctionDefinition(
		namespaceURI: string,
		localName: string,
		arity: number,
		functionDefinition: {
			callFunction: (
				dynamicContext: any,
				executionParameters: any,
				_staticContext: any,
				...parameters: any[]
			) => import('./dataTypes/ISequence').default;
			localName: string;
			namespaceURI: string;
			argumentTypes: import('./dataTypes/TypeDeclaration').default[];
			arity: number;
			returnType: import('./dataTypes/TypeDeclaration').default;
		}
	) {
		const hashKey = createHashKey(namespaceURI, localName) + '~' + arity;
		const duplicateFunction = this._registeredFunctionsByHash[hashKey];
		if (duplicateFunction) {
			throw new Error('Duplicate function registration');
		}

		this._registeredFunctionsByHash[hashKey] = functionDefinition;
	}

	lookupFunction(namespaceURI: string, localName: string, arity: number) {
		const hashKey = createHashKey(namespaceURI, localName) + '~' + arity;
		const foundFunction = this._registeredFunctionsByHash[hashKey];
		if (foundFunction) {
			return foundFunction;
		}

		return this.parentContext === null
			? null
			: this.parentContext.lookupFunction(namespaceURI, localName, arity);
	}

	/**
	 * Register the _existence_ of a variable.
	 *
	 * We need this to separate variable declaration (which is required to be done statically) and
	 * from when the dynamic context of the variable will be known.
	 */
	registerVariable(namespaceURI: string, localName: string) {
		const hash = createHashKey(namespaceURI, localName);
		return (this._registeredVariableBindingByHashKey[this._scopeDepth][hash] = `${hash}[${
			this._scopeCount
		}]`);
	}

	registerNamespace(prefix: string, namespaceURI: string) {
		this._registeredNamespaceURIByPrefix[this._scopeDepth][prefix] = namespaceURI;
	}

	lookupVariable(namespaceURI: string, localName: string) {
		const hash = createHashKey(namespaceURI, localName);
		const varNameInCurrentScope = lookupInOverrides(
			this._registeredVariableBindingByHashKey,
			hash
		);
		if (varNameInCurrentScope) {
			return varNameInCurrentScope;
		}
		return this.parentContext.lookupVariable(namespaceURI, localName);
	}

	introduceScope() {
		this._scopeCount++;
		this._scopeDepth++;

		this._registeredNamespaceURIByPrefix[this._scopeDepth] = Object.create(null);
		this._registeredVariableBindingByHashKey[this._scopeDepth] = Object.create(null);
	}

	removeScope() {
		this._registeredNamespaceURIByPrefix.length = this._scopeDepth;
		this._registeredVariableBindingByHashKey.length = this._scopeDepth;
		this._scopeDepth--;
	}

	resolveNamespace(prefix: string) {
		const uri = lookupInOverrides(this._registeredNamespaceURIByPrefix, prefix);
		if (uri === undefined) {
			return this.parentContext === null
				? undefined
				: this.parentContext.resolveNamespace(prefix);
		}
		return uri;
	}

	/**
	 * Make a clone of this static context at the current scope that can be retained for later usage
	 * (such as dynamic namespace lookups)
	 */
	cloneContext(): StaticContext {
		const contextAtThisPoint = new StaticContext(this.parentContext);
		for (let i = 0; i < this._scopeDepth + 1; ++i) {
			contextAtThisPoint._registeredNamespaceURIByPrefix = [
				Object.assign(
					Object.create(null),
					contextAtThisPoint._registeredNamespaceURIByPrefix[0],
					this._registeredNamespaceURIByPrefix[i]
				)
			];
			contextAtThisPoint._registeredVariableBindingByHashKey = [
				Object.assign(
					Object.create(null),
					contextAtThisPoint._registeredVariableBindingByHashKey[0],
					this._registeredVariableBindingByHashKey[i]
				)
			];
		}

		return contextAtThisPoint;
	}
}