import IContext from './Context';
import ISequence from './dataTypes/ISequence';
import TypeDeclaration from './dataTypes/TypeDeclaration';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import FunctionDefinitionType from './functions/FunctionDefinitionType';
import { FunctionProperties } from './functions/functionRegistry';

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

export type FunctionDefinition = {
	argumentTypes: TypeDeclaration[];
	arity: number;
	callFunction: FunctionDefinitionType;
	localName: string;
	namespaceURI: string;
	returnType: TypeDeclaration;
};

/**
 * The static context consists of all information that is available at compile time: the globally
 * defined functions, locally defined functions, etc.
 *
 * It will be overlayed by itself, but overlays the execution context, since that may know of
 * namespaces or variables that are also available in a global scope, but only when the selector uses
 * none.
 */
export default class StaticContext implements IContext {
	public parentContext: IContext;
	public registeredDefaultFunctionNamespace: string;
	public registeredVariableBindingByHashKey: any[];
	public registeredVariableDeclarationByHashKey: {
		[hash: string]: (
			dynamicContext: DynamicContext,
			executionParameters: ExecutionParameters
		) => ISequence;
	};
	private _registeredFunctionsByHash: any;
	private _registeredNamespaceURIByPrefix: any[];
	private _scopeCount: number;
	private _scopeDepth: number;

	constructor(parentContext: IContext) {
		this.parentContext = parentContext;

		this._scopeDepth = 0;
		this._scopeCount = 0;

		this._registeredNamespaceURIByPrefix = [Object.create(null)];

		// Functions may never be added for only a closure
		this._registeredFunctionsByHash = Object.create(null);

		this.registeredDefaultFunctionNamespace = parentContext.registeredDefaultFunctionNamespace;
		this.registeredVariableDeclarationByHashKey =
			parentContext.registeredVariableDeclarationByHashKey;
		this.registeredVariableBindingByHashKey = parentContext.registeredVariableBindingByHashKey;
	}

	/**
	 * Make a clone of this static context at the current scope that can be retained for later usage
	 * (such as dynamic namespace lookups)
	 */
	public cloneContext(): StaticContext {
		const contextAtThisPoint = new StaticContext(this.parentContext);
		for (let i = 0; i < this._scopeDepth + 1; ++i) {
			contextAtThisPoint._registeredNamespaceURIByPrefix = [
				Object.assign(
					Object.create(null),
					contextAtThisPoint._registeredNamespaceURIByPrefix[0],
					this._registeredNamespaceURIByPrefix[i]
				)
			];
			contextAtThisPoint.registeredVariableBindingByHashKey = [
				Object.assign(
					Object.create(null),
					contextAtThisPoint.registeredVariableBindingByHashKey[0],
					this.registeredVariableBindingByHashKey[i]
				)
			];
			contextAtThisPoint._registeredFunctionsByHash = Object.assign(
				Object.create(null),
				this._registeredFunctionsByHash
			);
			contextAtThisPoint.registeredVariableDeclarationByHashKey = this.registeredVariableDeclarationByHashKey;
			contextAtThisPoint.registeredDefaultFunctionNamespace = this.registeredDefaultFunctionNamespace;
		}

		return contextAtThisPoint;
	}

	public getVariableBindings(): string[] {
		return Object.keys(this.registeredVariableDeclarationByHashKey);
	}

	public getVariableDeclaration(
		hashKey: string
	): (dynamicContext: DynamicContext, executionParameters: ExecutionParameters) => ISequence {
		return this.registeredVariableDeclarationByHashKey[hashKey];
	}

	public introduceScope() {
		this._scopeCount++;
		this._scopeDepth++;

		this._registeredNamespaceURIByPrefix[this._scopeDepth] = Object.create(null);
		this.registeredVariableBindingByHashKey[this._scopeDepth] = Object.create(null);
	}

	public lookupFunction(
		namespaceURI: string,
		localName: string,
		arity: number
	): FunctionProperties | null {
		const hashKey = createHashKey(namespaceURI, localName) + '~' + arity;
		const foundFunction = this._registeredFunctionsByHash[hashKey];
		if (foundFunction) {
			return foundFunction;
		}

		return this.parentContext === null
			? null
			: this.parentContext.lookupFunction(namespaceURI, localName, arity);
	}

	public lookupVariable(namespaceURI: string, localName: string): string {
		const hash = createHashKey(namespaceURI, localName);
		const varNameInCurrentScope = lookupInOverrides(
			this.registeredVariableBindingByHashKey,
			hash
		);
		if (varNameInCurrentScope) {
			return varNameInCurrentScope;
		}
		return this.parentContext.lookupVariable(namespaceURI, localName);
	}

	public lookupVariableValue(namespaceURI: string, localName: string) {
		const hash = createHashKey(namespaceURI, localName);
		const varNameInCurrentScope = this.registeredVariableDeclarationByHashKey[hash];
		if (varNameInCurrentScope) {
			return varNameInCurrentScope;
		}
		return null;
	}

	public registerFunctionDefinition(
		namespaceURI: string,
		localName: string,
		arity: number,
		functionDefinition: FunctionDefinition
	) {
		const hashKey = createHashKey(namespaceURI, localName) + '~' + arity;
		const duplicateFunction = this._registeredFunctionsByHash[hashKey];
		if (duplicateFunction) {
			throw new Error('Duplicate function registration');
		}

		this._registeredFunctionsByHash[hashKey] = functionDefinition;
	}

	public registerNamespace(prefix: string, namespaceURI: string) {
		this._registeredNamespaceURIByPrefix[this._scopeDepth][prefix] = namespaceURI;
	}

	/**
	 * Register the _existence_ of a variable.
	 *
	 * We need this to separate variable declaration (which is required to be done statically) and
	 * from when the dynamic context of the variable will be known.
	 */
	public registerVariable(namespaceURI: string | null, localName: string) {
		const hash = createHashKey(namespaceURI || '', localName);
		return (this.registeredVariableBindingByHashKey[this._scopeDepth][
			hash
		] = `${hash}[${this._scopeCount}]`);
	}

	public registerVariableDeclaration(
		namespaceURI: string,
		localName: string,
		createValue: (
			dynamicContext: DynamicContext,
			executionParameters: ExecutionParameters
		) => ISequence
	) {
		const hash = `${createHashKey(namespaceURI || '', localName)}[${this._scopeCount}]`;
		this.registeredVariableDeclarationByHashKey[hash] = createValue;
	}

	public removeScope() {
		this._registeredNamespaceURIByPrefix.length = this._scopeDepth;
		this.registeredVariableBindingByHashKey.length = this._scopeDepth;
		this._scopeDepth--;
	}

	public resolveNamespace(prefix: string): string {
		const uri = lookupInOverrides(this._registeredNamespaceURIByPrefix, prefix);
		if (uri === undefined) {
			return this.parentContext === null
				? undefined
				: this.parentContext.resolveNamespace(prefix);
		}
		return uri;
	}
}
