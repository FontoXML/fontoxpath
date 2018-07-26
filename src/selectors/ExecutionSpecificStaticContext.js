import Context from './Context';
import functionRegistry from './functions/functionRegistry';

import {
	staticallyKnownNamespaceByPrefix
} from './staticallyKnownNamespaces';


/**
 * XPaths in FontoXPath know of two separate contexts: the static one and the context at evaluation.
 *
 * Because FontoXPath allows injecting variables and namespace declarations at evaluation time,
 * static compilation _may_ depend on evaluation context.
 *
 * If it does, this execution context will be used to mark the statically compiled selector as
 * specific for the evaluation context. If the XPath did not depend on the evaluation context, it
 * will be reused.
 *
 * @implements {Context}
 */
export default class ExecutionSpecificStaticContext {
	constructor (namespaceResolver, variableByName) {
		this._namespaceResolver = namespaceResolver;
		this._variableByName = variableByName;

		/**
		 * This flag will be set to true if this EvaluationContext was used while statically
		 * compiling a Selector
		 */
		this.executionContextWasRequired = false;
	}

	resolveNamespace (prefix) {
		// See if it 'statically' known:
		if (staticallyKnownNamespaceByPrefix[prefix]) {
			return staticallyKnownNamespaceByPrefix[prefix];
		}
		this.executionContextWasRequired = true;

		const uri = this._namespaceResolver(prefix);
		if (uri === undefined && !prefix) {
			return null;
		}
		return uri;
	}

	lookupVariable (namespaceURI, localName) {
		this.executionContextWasRequired = true;

		if (namespaceURI) {
			return null;
		}

		return this._variableByName[localName];
	}

	lookupFunction (namespaceURI, localName, arity) {
		// It is impossible to inject functions at execution time, so we can always return a globally defined one.
		return functionRegistry.getFunctionByArity(namespaceURI, localName, arity);
	}
}
