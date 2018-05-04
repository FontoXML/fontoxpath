function createHashKey (namespaceURI, localName) {
	return `Q{${namespaceURI}}${localName}`;
}

export default class StaticContext {
	constructor (parentContext) {
		/**
		 * @type {StaticContext|null}
		 */
		this.parentContext = parentContext;

		this._registeredFunctionsByHash = Object.create(null);
		this._registeredNamespaces = Object.create(null);
	}

	registerFunctionDefinition (namespaceURI, localName, arity, compileFunction) {
		if (!this._registeredFunctionsByHash[createHashKey(namespaceURI, localName)]) {
			this._registeredFunctionsByHash[createHashKey(namespaceURI, localName)] = [];
		}
		this._registeredFunctionsByHash[createHashKey(namespaceURI, localName)].push({
			arity: arity,
			isCompiled: false,
			compileFunction: compileFunction,
			compiledFunction: null
		});
	}

	lookupFunction (namespaceURI, localName, arity) {
		const functionDefinitionsForFunction = this._registeredFunctionsByHash[createHashKey(namespaceURI, localName)];

		if (!functionDefinitionsForFunction) {
			return this.parentContext === null ? null : this.parentContext.lookupFunction(
				namespaceURI,
				localName,
				arity);
		}

		const functionDefinitionForArity = functionDefinitionsForFunction.find(func => func.arity === arity);
		if (!functionDefinitionForArity) {
			return this.parentContext === null ? null : this.parentContext.lookupFunction(
				namespaceURI,
				localName,
				arity);
		}

		if (!functionDefinitionForArity.isCompiled) {
			functionDefinitionForArity.compiledFunction = functionDefinitionForArity.compileFunction();
			functionDefinitionForArity.isCompiled = true;
		}

		return functionDefinitionForArity.compiledFunction;
	}

	registerNamespace (prefix, namespaceURI) {
		if (prefix in this._registeredNamespaces) {
			throw new Error('Duplicate namespace decalaration');
		}

		this._registeredNamespaces[prefix] = namespaceURI;
	}

	lookupVariable (_namespaceURI, _localName) {
		// TODO
	}

	resolveNamespace (prefix) {
		return this._registeredNamespaces ||
			this.parentContext === null ? null : this.parentContext.resolveNamespace(prefix);
	}
}
