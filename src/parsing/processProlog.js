import astHelper from './astHelper';
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
 * @typedef {Array<string|Object|Array>} AST
 */
let AST;

/**
 * @param   {!AST}            prolog              The prolog of the module to process
 * @param   {!StaticContext}  staticContext
 */
export default function processProlog (prolog, staticContext) {
	const staticallyCompilableExpressions = [];

	const compiledFunctionDeclarations = [];

	astHelper.getChildren(prolog, '*').some(feature => {
		switch (feature[0]) {
			case 'moduleImport':
			case 'namespaceDecl':
			case 'functionDecl':
			case 'varDecl':
				break;
			default:
				throw new Error('Not implemented: only module imports, namespace declarations, and function declarations are implemented in XQuery modules');
		}
	});

	// First, let's import modules
	astHelper.getChildren(prolog, 'moduleImport').forEach(moduleImport => {
		const moduleImportPrefix = astHelper.getTextContent(astHelper.getFirstChild(moduleImport, 'namespacePrefix'));
		const moduleImportNamespaceURI = astHelper.getTextContent(astHelper.getFirstChild(moduleImport, 'targetNamespace'));

		staticContext.registerNamespace(moduleImportPrefix, moduleImportNamespaceURI);
		enhanceStaticContextWithModule(staticContext, moduleImportNamespaceURI);
	});
	astHelper.getChildren(prolog, 'namespaceDecl').forEach(namespaceDecl =>
		staticContext.registerNamespace(
			astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'prefix')),
			astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'uri'))));

	astHelper.getChildren(prolog, 'moduleSettings').forEach(moduleSetting => {
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

	astHelper.getChildren(prolog, 'functionDecl').forEach(declaration => {
		const functionName = astHelper.getFirstChild(declaration, 'functionName');
		const declarationPrefix = astHelper.getAttribute(functionName, 'prefix');
		let declarationNamespaceURI = astHelper.getAttribute(functionName, 'URI');
		const declarationLocalName = astHelper.getTextContent(functionName);

		if (declarationNamespaceURI === null) {
			declarationNamespaceURI = staticContext.resolveNamespace(declarationPrefix || '');

			if (!declarationNamespaceURI && declarationPrefix) {
				throw new Error(`XPST0081: The prefix "${declarationPrefix}" could not be resolved`);
			}
		}

		if (RESERVED_FUNCTION_NAMESPACE_URIS.includes(declarationNamespaceURI)) {
			throw new Error('XQST0045: Functions and variables may not be declared in one of the reserved namespace URIs.');
		}

		// Functions are public unless they're private
		const isPublicDeclaration = astHelper
			.getChildren(declaration, 'annotation')
			.map(annotation => astHelper.getFirstChild(annotation, 'annotationName'))
			.every(annotationName => !astHelper.getAttribute(annotationName, 'URI') && astHelper.getTextContent(annotationName) !== 'private');

		if (!declarationNamespaceURI) {
			throw new Error('XQST0060: Functions declared in a module must reside in a namespace.');
		}

		// functionBody always has a single expression
		const body = /** @type {!Array} */ (astHelper.getFirstChild(declaration, 'functionBody')[1]);
		const returnType = astHelper.getTypeDeclaration(declaration);
		const params = astHelper.getChildren(astHelper.getFirstChild(declaration, 'paramList'), 'param');
		const paramNames = params.map(param => astHelper.getFirstChild(param, 'varName'));
		const paramTypes = params.map(param => astHelper.getTypeDeclaration(param));

		if (staticContext.lookupFunction(declarationNamespaceURI, declarationLocalName, paramTypes.length)) {
			throw new Error(
				`XQST0049: The function Q{${declarationNamespaceURI}}${declarationLocalName}#${paramTypes.length} has already been declared.`);
		}

		const compiledFunctionBody = compileAstToExpression(body, { allowXQuery: true });

		const staticContextLeaf = new StaticContext(staticContext);
		const parameterBindingNames = paramNames.map(param => {
			let namespaceURI = astHelper.getAttribute(param, 'URI');
			const prefix = astHelper.getAttribute(param, 'prefix');
			const localName = astHelper.getTextContent(param);

			if (prefix && namespaceURI === null) {
				namespaceURI = staticContext.resolveNamespace(prefix || '');
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
	});

	const registeredVariables = [];
	astHelper.getChildren(prolog, 'varDecl').forEach(varDecl => {
		const varName = astHelper.getQName(astHelper.getFirstChild(varDecl, 'varName'));
		const external = astHelper.getFirstChild(varDecl, 'external');
		if (!external || astHelper.getFirstChild(external, 'varValue')) {
			throw new Error('Not implemented: only external variable declaration without default value is implemented in XQuery modules');
		}

		if (registeredVariables.some(registered => registered.namespaceURI === varName.namespaceURI && registered.localName === varName.localName)) {
			throw new Error(`XQST0049: The variable ${varName.namespaceURI ? `Q{${varName.namespaceURI}}` : ''}${varName.localName} has already been declared.`);
		}
		if (!staticContext.lookupVariable(varName.namespaceURI, varName.localName)) {
		staticContext.registerVariable(varName.namespaceURI, varName.localName);
		}
		registeredVariables.push(varName);
	});

	staticallyCompilableExpressions.forEach(({ expression, staticContextLeaf }) => {
		expression.performStaticEvaluation(staticContextLeaf);
	});

	return {
		functionDeclarations: compiledFunctionDeclarations
	};
}
