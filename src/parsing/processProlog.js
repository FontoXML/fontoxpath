import compileAstToExpression from './compileAstToExpression';

import Sequence from '../expressions/dataTypes/Sequence';
import createDoublyIterableSequence from '../expressions/util/createDoublyIterableSequence';
import StaticContext from '../expressions/StaticContext';

import { enhanceStaticContextWithModule } from './globalModuleCache';

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

/**
 * @param   {!Prolog}         prolog              The prolog of the module to process
 * @param   {!StaticContext}  staticContext
 */
export default function processProlog (prolog, staticContext) {
	const staticallyCompilableExpressions = [];

	const compiledFunctionDeclarations = [];

	// First, let's import modules
	prolog['moduleSettings'].forEach(moduleSetting => {
		const type = moduleSetting['type'];
		switch (type) {
			case 'moduleImport': {
				const moduleImportPrefix = moduleSetting['prefix'];
				const moduleImportNamespaceURI = moduleSetting['namespaceURI'];

				staticContext.registerNamespace(moduleImportPrefix, moduleImportNamespaceURI);

				enhanceStaticContextWithModule(staticContext, moduleImportNamespaceURI);
				break;
			}
			case 'namespaceDecl': {
				staticContext.registerNamespace(moduleSetting['prefix'], moduleSetting['namespaceURI']);
				break;
			}
			default: throw new Error('Not implemented: only module imports and function declarations are implemented in XQuery modules');
		}
	});

	prolog['declarations'].forEach(declaration => {

		switch (declaration['type']) {
			case 'functionDeclaration': {
				let [ declarationPrefix, declarationNamespaceURI, declarationLocalName ] = declaration['name'];

				if (!declarationNamespaceURI) {
					declarationNamespaceURI = staticContext.resolveNamespace(declarationPrefix);

					if (!declarationNamespaceURI && declarationPrefix) {
						throw new Error(`XPST0081: The prefix "${declarationPrefix}" could not be resolved`);
					}
				}

				if (RESERVED_FUNCTION_NAMESPACE_URIS.includes(declarationNamespaceURI)) {
					throw new Error('XQST0045: Functions and variables may not be declared in one of the reserved namespace URIs.');
				}
				const annotations = declaration['annotations'].map(annotation => {
					let annotationNamespaceURI = annotation[0][1];
					const annotationPrefix = annotation[0][0];
					if (!annotationNamespaceURI) {
						annotationNamespaceURI = staticContext.resolveNamespace(annotationPrefix);
					}
					if (!annotationNamespaceURI && annotationPrefix) {
						throw new Error(`XPST0008: The prefix ${annotationPrefix} is not declared`);
					}
					return {
						annotationName: {
							prefix: annotationPrefix,
							namespaceURI: annotationNamespaceURI,
							localName: annotation[0][2]
						},
						parameters: annotation[1]
					};
				});
				// Functions are public unless they're private
				const isPublicDeclaration = annotations.every(annotation => !annotation.namespaceURI && annotation.localName !== 'private');

				if (!declarationNamespaceURI) {
					throw new Error('XQST0060: Functions declared in a module must reside in a namespace.');
				}

				const body = declaration['body'];
				const returnType = declaration['returnType'];
				const paramNames = declaration['params'].map(([name]) => name);
				const paramTypes = declaration['params'].map(([_name, type]) => type);

				if (staticContext.lookupFunction(declarationNamespaceURI, declarationLocalName, paramTypes.length)) {
					throw new Error(
						`XQST0049: The function Q{${declarationNamespaceURI}}${declarationLocalName}#${paramTypes.length} has already been declared.`);
				}

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
					localName: declarationLocalName,
					namespaceURI: declarationNamespaceURI,
					argumentTypes: paramTypes,
					arity: paramNames.length,
					returnType: returnType
				};

				staticContext.registerFunctionDefinition(
					declarationNamespaceURI,
					declarationLocalName,
					paramNames.length,
					functionDefinition);

				staticallyCompilableExpressions.push({
					expression: compiledFunctionBody,
					staticContextLeaf: staticContextLeaf
				});

				if (isPublicDeclaration) {
					// Only mark the registration as the public API for the module if it's public
					compiledFunctionDeclarations.push({
						namespaceURI: declarationNamespaceURI,
						localName: declarationLocalName,
						arity: paramNames.length,
						functionDefinition
					});
				}
				break;
			}
			default: {
				throw new Error('Not implemented: only module imports and function declarations are implemented in XQuery modules');
			}
		}
	});

	staticallyCompilableExpressions.forEach(({ expression, staticContextLeaf }) => {
		expression.performStaticEvaluation(staticContextLeaf);
	});

	return {
		functionDeclarations: compiledFunctionDeclarations
	};
}
