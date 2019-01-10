import Context from './Context';
import { getFunctionByArity } from './functions/functionRegistry';

import { staticallyKnownNamespaceByPrefix } from './staticallyKnownNamespaces';

export const generateGlobalVariableBindingName = variableName => `GLOBAL_${variableName}`;

/**
 * XPaths in FontoXPath know of two separate contexts: the static one and the context at evaluation.
 *
 * Because FontoXPath allows injecting variables and namespace declarations at evaluation time,
 * static compilation _may_ depend on evaluation context.
 *
 * If it does, this execution context will be used to mark the statically compiled selector as
 * specific for the evaluation context. If the XPath did not depend on the evaluation context, it
 * will be reused.
 */
export default class ExecutionSpecificStaticContext implements Context {
	executionContextWasRequired: boolean;

	private _namespaceResolver: any;
	private _variableBindingByName: any;
	private _referredVariableByName: any;
	private _referredNamespaceByName: any;
	private _variableValueByName: any;

	constructor(namespaceResolver, variableByName) {
		this._namespaceResolver = namespaceResolver;
		this._variableBindingByName = Object.keys(variableByName).reduce(
			(bindings, variableName) => {
				if (variableByName[variableName] === undefined) {
					return bindings;
				}
				bindings[variableName] = generateGlobalVariableBindingName(variableName);
				return bindings;
			},
			Object.create(null)
		);

		this._referredVariableByName = Object.create(null);
		this._referredNamespaceByName = Object.create(null);

		this._variableValueByName = variableByName;

		/**
		 * This flag will be set to true if this EvaluationContext was used while statically
		 * compiling a Expression
		 */
		this.executionContextWasRequired = false;
	}

	resolveNamespace(prefix) {
		// See if it 'globally' known:
		if (staticallyKnownNamespaceByPrefix[prefix]) {
			return staticallyKnownNamespaceByPrefix[prefix];
		}
		this.executionContextWasRequired = true;

		const uri = this._namespaceResolver(prefix);

		if (!this._referredNamespaceByName[prefix]) {
			this._referredNamespaceByName[prefix] = {
				prefix: prefix,
				namespaceURI: uri
			};
		}

		if (uri === undefined && !prefix) {
			return null;
		}

		return uri;
	}

	lookupVariable(namespaceURI, localName) {
		this.executionContextWasRequired = true;

		if (namespaceURI) {
			return null;
		}

		const bindingName = this._variableBindingByName[localName];
		if (!this._referredVariableByName[localName]) {
			this._referredVariableByName[localName] = {
				name: localName,
				value: this._variableValueByName[localName]
			};
		}
		return bindingName;
	}

	lookupFunction(namespaceURI, localName, arity) {
		// It is impossible to inject functions at execution time, so we can always return a globally defined one.
		return getFunctionByArity(namespaceURI, localName, arity);
	}

	getReferredNamespaces(): string[] {
		return Object.values(this._referredNamespaceByName);
	}

	getReferredVariables(): string[] {
		return Object.values(this._referredVariableByName);
	}
}
