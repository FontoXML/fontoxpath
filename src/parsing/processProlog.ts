import astHelper, { IAST } from './astHelper';
import compileAstToExpression from './compileAstToExpression';

import sequenceFactory from '../expressions/dataTypes/sequenceFactory';
import StaticContext, { GenericFunctionDefinition } from '../expressions/StaticContext';
import createDoublyIterableSequence from '../expressions/util/createDoublyIterableSequence';

import { enhanceStaticContextWithModule } from './globalModuleCache';

import ISequence from '../expressions/dataTypes/ISequence';
import DynamicContext from '../expressions/DynamicContext';
import ExecutionParameters from '../expressions/ExecutionParameters';
import Expression from '../expressions/Expression';
import FunctionDefinitionType from '../expressions/functions/FunctionDefinitionType';
import {
	errXPST0081,
	errXQST0045,
	errXQST0060,
	errXQST0066,
	errXQST0070
} from '../expressions/xquery/XQueryErrors';
import UpdatingExpression from '../expressions/xquery-update/UpdatingExpression';
import UpdatingFunctionDefinitionType from '../expressions/xquery-update/UpdatingFunctionDefinitionType';

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

type FunctionDeclaration = {
	arity: number;
	functionDefinition: object;
	localName: string;
	namespaceURI: string;
};

export default function processProlog(
	prolog: IAST,
	staticContext: StaticContext
): { functionDeclarations: FunctionDeclaration[] } {
	const staticallyCompilableExpressions: {
		expression: Expression;
		staticContextLeaf: StaticContext;
	}[] = [];

	const compiledFunctionDeclarations: FunctionDeclaration[] = [];
	astHelper.getChildren(prolog, '*').forEach(feature => {
		switch (feature[0]) {
			case 'moduleImport':
			case 'namespaceDecl':
			case 'defaultNamespaceDecl':
			case 'functionDecl':
			case 'varDecl':
				break;
			default:
				throw new Error(
					'Not implemented: only module imports, namespace declarations, and function declarations are implemented in XQuery modules'
				);
		}
	});

	// First, let's import modules
	astHelper.getChildren(prolog, 'moduleImport').forEach(moduleImport => {
		const moduleImportPrefix = astHelper.getTextContent(
			astHelper.getFirstChild(moduleImport, 'namespacePrefix')
		);
		const moduleImportNamespaceURI = astHelper.getTextContent(
			astHelper.getFirstChild(moduleImport, 'targetNamespace')
		);

		staticContext.registerNamespace(moduleImportPrefix, moduleImportNamespaceURI);
		enhanceStaticContextWithModule(staticContext, moduleImportNamespaceURI);
	});

	astHelper.getChildren(prolog, 'namespaceDecl').forEach(namespaceDecl => {
		const prefix = astHelper.getTextContent(astHelper.getFirstChild(namespaceDecl, 'prefix'));
		const namespaceURI = astHelper.getTextContent(
			astHelper.getFirstChild(namespaceDecl, 'uri')
		);

		if (prefix === 'xml' || prefix === 'xmlns') {
			throw errXQST0070();
		}

		if (
			namespaceURI === 'http://www.w3.org/XML/1998/namespace' ||
			namespaceURI === 'http://www.w3.org/2000/xmlns/'
		) {
			throw errXQST0070();
		}

		staticContext.registerNamespace(prefix, namespaceURI);
	});

	// Default function namespace declaration
	const defaultNamespaceFunctionDecl = astHelper
		.getChildren(prolog, 'defaultNamespaceDecl')
		.filter(child => {
			const type = astHelper.getTextContent(
				astHelper.getFirstChild(child, 'defaultNamespaceCategory')
			);

			if (type === 'function') {
				return type;
			} else if (type === 'element') {
				throw new Error('Not Implemented: default namespace element.');
			}
		});

	if (defaultNamespaceFunctionDecl.length === 1) {
		const namespaceURI = astHelper.getTextContent(
			astHelper.getFirstChild(astHelper.getFirstChild(prolog, 'defaultNamespaceDecl'), 'uri')
		);

		if (!namespaceURI) {
			throw errXQST0060();
		}

		if (
			namespaceURI === 'http://www.w3.org/XML/1998/namespace' ||
			namespaceURI === 'http://www.w3.org/2000/xmlns/'
		) {
			throw errXQST0070();
		}

		staticContext.registeredDefaultFunctionNamespace = namespaceURI;
	} else if (defaultNamespaceFunctionDecl.length > 1) {
		throw errXQST0066();
	}

	astHelper.getChildren(prolog, 'functionDecl').forEach(declaration => {
		const functionName = astHelper.getFirstChild(declaration, 'functionName');
		const declarationPrefix = astHelper.getAttribute(functionName, 'prefix');
		let declarationNamespaceURI = astHelper.getAttribute(functionName, 'URI');
		const declarationLocalName = astHelper.getTextContent(functionName);

		if (declarationNamespaceURI === null) {
			declarationNamespaceURI =
				declarationPrefix === null
					? staticContext.registeredDefaultFunctionNamespace
					: staticContext.resolveNamespace(declarationPrefix);

			if (!declarationNamespaceURI && declarationPrefix) {
				throw errXPST0081(declarationPrefix);
			}
		}

		if (RESERVED_FUNCTION_NAMESPACE_URIS.includes(declarationNamespaceURI)) {
			throw errXQST0045();
		}

		// Functions are public unless they're private
		const annotations = astHelper
			.getChildren(declaration, 'annotation')
			.map(annotation => astHelper.getFirstChild(annotation, 'annotationName'));
		const isPublicDeclaration = annotations.every(
			annotationName =>
				!astHelper.getAttribute(annotationName, 'URI') &&
				astHelper.getTextContent(annotationName) !== 'private'
		);
		const isUpdatingFunction = annotations.some(
			annotationName =>
				!astHelper.getAttribute(annotationName, 'URI') &&
				astHelper.getTextContent(annotationName) === 'updating'
		);

		if (!declarationNamespaceURI) {
			throw errXQST0060();
		}

		const functionBody = astHelper.getFirstChild(declaration, 'functionBody');
		if (!functionBody) {
			// This function will be declared as a registerCustomXPathFunction, making it globally
			// available later on. We do not need to export it here
			return;
		}

		// functionBody usually has a single expression
		const body = functionBody[1];
		const returnType = astHelper.getTypeDeclaration(declaration);
		const params = astHelper.getChildren(
			astHelper.getFirstChild(declaration, 'paramList'),
			'param'
		);
		const paramNames = params.map(param => astHelper.getFirstChild(param, 'varName'));
		const paramTypes = params.map(param => astHelper.getTypeDeclaration(param));

		if (
			staticContext.lookupFunction(
				declarationNamespaceURI,
				declarationLocalName,
				paramTypes.length
			)
		) {
			throw new Error(
				`XQST0049: The function Q{${declarationNamespaceURI}}${declarationLocalName}#${paramTypes.length} has already been declared.`
			);
		}

		const compiledFunctionBody = compileAstToExpression(body as IAST, {
			allowUpdating: false,
			allowXQuery: true
		});

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

		let functionDefinition: GenericFunctionDefinition<any, any>;
		if (isUpdatingFunction) {
			const executeFunction: UpdatingFunctionDefinitionType = (
				dynamicContext: DynamicContext,
				executionParameters: ExecutionParameters,
				_staticContext: StaticContext,
				...parameters: ISequence[]
			) => {
				const scopedDynamicContext = dynamicContext
					.scopeWithFocus(-1, null, sequenceFactory.empty())
					.scopeWithVariableBindings(
						parameterBindingNames.reduce((paramByName, bindingName, i) => {
							paramByName[bindingName] = createDoublyIterableSequence(parameters[i]);
							return paramByName;
						}, Object.create(null))
					);
				return (compiledFunctionBody as UpdatingExpression).evaluateWithUpdateList(
					scopedDynamicContext,
					executionParameters
				);
			};

			functionDefinition = {
				argumentTypes: paramTypes,
				arity: paramNames.length,
				callFunction: executeFunction,
				isUpdating: true,
				localName: declarationLocalName,
				namespaceURI: declarationNamespaceURI,
				returnType
			};
		} else {
			const executeFunction: FunctionDefinitionType = (
				dynamicContext: DynamicContext,
				executionParameters: ExecutionParameters,
				_staticContext: StaticContext,
				...parameters: ISequence[]
			): ISequence => {
				const scopedDynamicContext = dynamicContext
					.scopeWithFocus(-1, null, sequenceFactory.empty())
					.scopeWithVariableBindings(
						parameterBindingNames.reduce((paramByName, bindingName, i) => {
							paramByName[bindingName] = createDoublyIterableSequence(parameters[i]);
							return paramByName;
						}, Object.create(null))
					);
				return compiledFunctionBody.evaluateMaybeStatically(
					scopedDynamicContext,
					executionParameters
				);
			};

			functionDefinition = {
				argumentTypes: paramTypes,
				arity: paramNames.length,
				callFunction: executeFunction,
				isUpdating: false,
				localName: declarationLocalName,
				namespaceURI: declarationNamespaceURI,
				returnType
			};
		}

		staticContext.registerFunctionDefinition(
			declarationNamespaceURI,
			declarationLocalName,
			paramNames.length,
			functionDefinition
		);
		staticallyCompilableExpressions.push({
			expression: compiledFunctionBody,
			staticContextLeaf
		});

		if (isPublicDeclaration) {
			// Only mark the registration as the public API for the module if it's public
			compiledFunctionDeclarations.push({
				arity: paramNames.length,
				functionDefinition,
				localName: declarationLocalName,
				namespaceURI: declarationNamespaceURI
			});
		}
	});

	const registeredVariables: { localName: string; namespaceURI: null | string }[] = [];
	astHelper.getChildren(prolog, 'varDecl').forEach(varDecl => {
		const varName = astHelper.getQName(astHelper.getFirstChild(varDecl, 'varName'));
		let declarationNamespaceURI = varName.namespaceURI;
		if (declarationNamespaceURI === null) {
			declarationNamespaceURI = staticContext.resolveNamespace(varName.prefix);

			if (!declarationNamespaceURI && varName.prefix) {
				throw errXPST0081(varName.prefix);
			}
		}

		if (RESERVED_FUNCTION_NAMESPACE_URIS.includes(declarationNamespaceURI)) {
			throw errXQST0045();
		}
		const external = astHelper.getFirstChild(varDecl, 'external');
		const getVarValue = astHelper.getFirstChild(varDecl, 'varValue');

		let varValue: IAST;
		let compiledFunctionAsExpression: Expression;

		if (external !== null) {
			const varDefaultValue = astHelper.getFirstChild(external, 'varValue');
			if (varDefaultValue !== null) {
				varValue = astHelper.getFirstChild(varDefaultValue, '*');
			}
		} else if (getVarValue !== null) {
			varValue = astHelper.getFirstChild(getVarValue, '*');
		}

		if (varValue) {
			compiledFunctionAsExpression = compileAstToExpression(varValue as IAST, {
				allowUpdating: false,
				allowXQuery: true
			});
		}

		if (
			registeredVariables.some(
				registered =>
					registered.namespaceURI === declarationNamespaceURI &&
					registered.localName === varName.localName
			)
		) {
			throw new Error(
				`XQST0049: The variable ${
					declarationNamespaceURI ? `Q{${declarationNamespaceURI}}` : ''
				}${varName.localName} has already been declared.`
			);
		}

		staticContext.registerVariable(declarationNamespaceURI || '', varName.localName);

		if (
			varValue &&
			!staticContext.lookupVariableValue(declarationNamespaceURI || '', varName.localName)
		) {
			let cachedVariableValue: () => ISequence | null = null;
			staticContext.registerVariableDeclaration(
				declarationNamespaceURI,
				varName.localName,
				(dynamicContext, executionParameters) => {
					if (cachedVariableValue) {
						return cachedVariableValue();
					}
					cachedVariableValue = createDoublyIterableSequence(
						compiledFunctionAsExpression.evaluateMaybeStatically(
							dynamicContext,
							executionParameters
						)
					);
					return cachedVariableValue();
				}
			);
			staticallyCompilableExpressions.push({
				expression: compiledFunctionAsExpression,
				staticContextLeaf: staticContext
			});

			registeredVariables.push(varName);
		}
	});

	staticallyCompilableExpressions.forEach(({ expression, staticContextLeaf }) => {
		expression.performStaticEvaluation(staticContextLeaf);
	});

	return {
		functionDeclarations: compiledFunctionDeclarations
	};
}
