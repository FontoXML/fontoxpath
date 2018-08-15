import Sequence from './expressions/dataTypes/Sequence';
import createDoublyIterableSequence from './expressions/util/createDoublyIterableSequence';
import { parse } from './parsing/xPathParser';
import compileAstToExpression from './parsing/compileAstToExpression';
import StaticContext from './expressions/StaticContext';
import ExecutionSpecificStaticContext from './expressions/ExecutionSpecificStaticContext';

import { loadModuleFile } from './globalModuleCache';

const RESERVED_FUNCTION_NAMESPACE_URIS = [
	'http://www.w3.org/XML/1998/namespace',
	'http://www.w3.org/2001/XMLSchema',
	'http://www.w3.org/2001/XMLSchema-instance',
	'http://www.w3.org/2005/xpath-functions',
	'http://www.w3.org/2005/xpath-functions/math',
	'http://www.w3.org/2012/xquery',
	'http://www.w3.org/2005/xpath-functions/array',
	'http://www.w3.org/2005/xpath-functions/map'
];

/**
* @typedef {{prolog: Prolog}}
*/
let XQueryModuleAST;

/**
* @typedef {{declarations: AnnotatedDeclaration}}
*/
let Prolog;

/**
* @typedef {{annotations: ?, declaration: Declaration}}
*/
let AnnotatedDeclaration;

/**
* @typedef {{type: string, name: Array<string>, body: Array<?>, returnType: ?string, params: Array<?>}}
*/
let Declaration;

export default function registerXQueryModule (moduleString) {
	// TODO:
	// - Parse stuff
	// - Assert that this is a library (or should we? should we just disable XQuery main modules for now? Regard them as XPaths (`evaluateXPath(file.readString(prrt.xqm))?`))
	// - get the URI
	// - Register this to the global environment, under the URI
	// - Statically compile it (assuming every import can be resolved, TODO: figure out if XQuery has circular imports. I hope not...)

	/**
	 * @type {XQueryModuleAST}
	 */
	const parsedModule = parse(moduleString, { 'startRule': 'Module' });

	// First, lets get the module main bit
	const moduleTargetNamspaceURI = parsedModule['moduleDecl']['namespaceURI'];
	const prefix = parsedModule['moduleDecl']['prefix'];

	const staticContext = new StaticContext(new ExecutionSpecificStaticContext(() => null, Object.create(null)));

	staticContext.registerNamespace(prefix, moduleTargetNamspaceURI);

	const staticallyCompilableExpressions = [];

	const compiledFunctionDeclarations = [];

	parsedModule['prolog']['declarations'].forEach(declarationAndAnnotations => {
		const declaration = declarationAndAnnotations['declaration'];
		switch (declaration['type']) {
			case 'functionDeclaration': {
				let [ prefix, namespaceURI, localName ] = declaration['name'];

				if (!namespaceURI) {
					namespaceURI = staticContext.resolveNamespace(prefix);
				}

				if (!namespaceURI) {
					throw new Error('XQST0060: Functions declared in a library module must reside in a namespace.');
				}
				if (namespaceURI !== moduleTargetNamspaceURI) {
					throw new Error('XQST0048: Functions declared in a library module must reside in the module target namespace.');
				}
				if (RESERVED_FUNCTION_NAMESPACE_URIS.includes(namespaceURI)) {
					throw new Error('XQST0045: Functions may not be declared in one of the reserved namespace URIs.');
				}

				const body = declaration['body'];
				const returnType = declaration['returnType'];
				const paramNames = declaration['params'].map(([name]) => name);
				const paramTypes = declaration['params'].map(([_name, type]) => type);

				const compiledFunctionBody = compileAstToExpression(body, { allowXQuery: true });

				const staticContextLeaf = new StaticContext(staticContext);
				const parameterBindingNames = paramNames.map(param => {
					let namespaceURI = param[0];
					const prefix = param[1];
					const localName = param[2];

					if (!namespaceURI === null && prefix !== '*') {
						namespaceURI = staticContext.resolveNamespace(prefix);
					}
					return staticContextLeaf.registerVariable(namespaceURI, localName);
				});


				const executeFunction = (
					dynamicContext,
					executionParameters,
					_staticContext,
					...parameters
				) => {
					const scopedDynamicContext = dynamicContext
						.scopeWithFocus(-1, null, Sequence.empty())
						.scopeWithVariableBindings(parameterBindingNames.reduce((paramByName, bindingName, i) => {
							paramByName[bindingName] = createDoublyIterableSequence(parameters[i]);
							return paramByName;
						}, Object.create(null)));
					return compiledFunctionBody.evaluateMaybeStatically(
						scopedDynamicContext,
						executionParameters);
				};

				const functionDefinition = {
						callFunction: executeFunction,
						localName: localName,
						namespaceURI: namespaceURI,
						argumentTypes: paramTypes,
						arity: paramNames.length,
						returnType: returnType
					};

				staticContext.registerFunctionDefinition(
					namespaceURI,
					localName,
					paramNames.length,
					functionDefinition);

				staticallyCompilableExpressions.push({
					expression: compiledFunctionBody,
					staticContextLeaf: staticContextLeaf
				});

				compiledFunctionDeclarations.push({
					namespaceURI: namespaceURI,
					localName: localName,
					arity: paramNames.length,
					functionDefinition
				});
			}
		}
	});

	staticallyCompilableExpressions.forEach(({ expression, staticContextLeaf }) => {
		expression.performStaticEvaluation(staticContextLeaf);
	});

	loadModuleFile(moduleTargetNamspaceURI, {
		functionDeclarations: compiledFunctionDeclarations
	});
}
