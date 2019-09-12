import IContext from './Context';
import ISequence from './dataTypes/ISequence';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import { FunctionProperties, getFunctionByArity } from './functions/functionRegistry';
import {
	FUNCTIONS_NAMESPACE_URI,
	staticallyKnownNamespaceByPrefix
} from './staticallyKnownNamespaces';

const generateGlobalVariableBindingName = (variableName: string) => `Q{}${variableName}[0]`;

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
export default class ExecutionSpecificStaticContext implements IContext {
	public executionContextWasRequired: boolean;
	public registeredDefaultFunctionNamespace: string = FUNCTIONS_NAMESPACE_URI;
	public registeredVariableBindingByHashKey: any[] = [Object.create(null)];
	public registeredVariableDeclarationByHashKey: {
		[hash: string]: (
			dynamicContext: DynamicContext,
			executionParameters: ExecutionParameters
		) => ISequence;
	} = Object.create(null);

	private _namespaceResolver: (namespaceURI: string) => null | string;

	// The static compilation step depends on the prefix -> namespaceURI pairs in the namespace resolver
	private _referredNamespaceByName: {
		[prefix: string]: { namespaceURI: string; prefix: string };
	};
	// And the ABSENCE of variables: a statically compiled XPath does not compile the same when external variables are absent in the calling code.
	private _referredVariableByName: {
		[variable: string]: { name: string };
	};
	private _variableBindingByName: { [variableName: string]: string };
	private _variableValueByName: any;

	constructor(namespaceResolver: (prefix: string) => string | null, variableByName: object) {
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

	public getReferredNamespaces(): { namespaceURI: string; prefix: string }[] {
		return Object.values(this._referredNamespaceByName);
	}

	public getReferredVariables(): { name: string }[] {
		return Object.values(this._referredVariableByName);
	}

	public lookupFunction(namespaceURI, localName, arity): FunctionProperties {
		// It is impossible to inject functions at execution time, so we can always return a globally defined one.
		return getFunctionByArity(namespaceURI, localName, arity);
	}

	public lookupVariable(namespaceURI: string, localName: string) {
		this.executionContextWasRequired = true;

		if (namespaceURI) {
			return null;
		}

		const bindingName = this._variableBindingByName[localName];
		if (!this._referredVariableByName[localName]) {
			this._referredVariableByName[localName] = {
				name: localName
			};
		}
		return bindingName;
	}

	public resolveNamespace(prefix: string) {
		// See if it 'globally' known:
		if (staticallyKnownNamespaceByPrefix[prefix]) {
			return staticallyKnownNamespaceByPrefix[prefix];
		}
		this.executionContextWasRequired = true;

		const uri = this._namespaceResolver(prefix);

		if (!this._referredNamespaceByName[prefix]) {
			this._referredNamespaceByName[prefix] = {
				namespaceURI: uri,
				prefix
			};
		}

		if (uri === undefined && !prefix) {
			return null;
		}

		return uri;
	}
}
