import Context from './Context';

function createHashKey (namespaceURI, localName) {
	return `Q{${namespaceURI}}${localName}`;
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

		this._registeredFunctionsByHash = Object.create(null);
		this._registeredNamespaces = Object.create(null);
		this._registeredVariablesByHash = Object.create(null);
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

	/**
	 * Register the _existence_ of a variable.
	 *
	 * We need this to separate variable declaration (which is required to be done statically) and
	 * from when the dynamic context of the variable will be known.
	 */
	registerVariable (namespaceURI, localName, createSequence) {
		this._registeredVariablesByHash[createHashKey(namespaceURI, localName)] = createSequence;
	}

	registerNamespace (prefix, namespaceURI) {
		if (prefix in this._registeredNamespaces) {
			throw new Error('Duplicate namespace decalaration');
		}

		this._registeredNamespaces[prefix] = namespaceURI;
	}

	lookupVariable (namespaceURI, localName) {
		return this._registeredVariablesByHash[createHashKey(namespaceURI, localName)] ||
			this.parentContext.lookupVariable(namespaceURI, localName);
	}

	/**
	 * @return {!StaticContext}
	 */
	introduceScope () {
		return new StaticContext(this);
	}

	resolveNamespace (prefix) {
		return this._registeredNamespaces ||
			this.parentContext === null ? null : this.parentContext.resolveNamespace(prefix);
	}
}
