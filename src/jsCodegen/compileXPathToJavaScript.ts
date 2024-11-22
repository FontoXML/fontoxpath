import { version } from 'chai';
import { EvaluableExpression } from '../evaluateXPath';
import {
	createDefaultFunctionNameResolver,
	createDefaultNamespaceResolver,
} from '../evaluationUtils/buildEvaluationContext';
import { printAndRethrowError } from '../evaluationUtils/printAndRethrowError';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from '../expressions/staticallyKnownNamespaces';
import StaticContext from '../expressions/StaticContext';
import astHelper from '../parsing/astHelper';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import convertXmlToAst from '../parsing/convertXmlToAst';
import normalizeEndOfLines from '../parsing/normalizeEndOfLines';
import parseExpression, { CompilationOptions } from '../parsing/parseExpression';
import annotateAst from '../typeInference/annotateAST';
import { AnnotationContext } from '../typeInference/AnnotationContext';
import { Language, Options } from '../types/Options';
import { CodeGenContext } from './CodeGenContext';
import compileAstToJavaScript from './compileAstToJavaScript';
import { JavaScriptCompiledXPathResult, rejectAst } from './JavaScriptCompiledXPath';

/**
 * Compile a given query to JavaScript code. For executing compiled code, see
 * {@link executeJavaScriptCompiledXPath}.
 *
 * @beta
 *
 * @param selector - The selector to compile. @param returnType - One of the return types indicating the value to be returned when executing the query.
 * @param returnType - Type compiled code should return.
 * @param options - Extra options for compiling this XPath.
 *
 * @returns A string JavaScript code representing the given selector.
 */
function compileXPathToJavaScript(
	selector: EvaluableExpression,
	returnType?: ReturnType,
	options?: Options | null,
): JavaScriptCompiledXPathResult {
	options = options || {};
	returnType = returnType || (ReturnType.ANY as any);

	let ast;
	if (typeof selector === 'string') {
		const expressionString = normalizeEndOfLines(selector);
		const parserOptions: CompilationOptions = {
			allowXQuery:
				options['language'] === Language.XQUERY_3_1_LANGUAGE ||
				options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
			// Debugging inserts xs:stackTrace in the AST, but this is not supported
			// yet by the js-codegen backend.
			debug: false,
			version:
				options['language'] === Language.XPATH_4_0_LANGUAGE ||
				options['language'] === Language.XQUERY_4_0_LANGUAGE ||
				options['language'] === Language.XQUERY_UPDATE_4_0_LANGUAGE
					? 4
					: 3.1,
		};
		try {
			ast = parseExpression(expressionString, parserOptions);
		} catch (error) {
			printAndRethrowError(expressionString, error);
		}
	} else {
		ast = convertXmlToAst(selector);
	}

	const mainModule = astHelper.getFirstChild(ast, 'mainModule');
	if (!mainModule) {
		return rejectAst(`Unsupported: XQuery Library modules are not supported.`);
	}
	const prolog = astHelper.getFirstChild(mainModule, 'prolog');
	if (prolog) {
		return rejectAst(`Unsupported: XQuery Prologs are not supported.`);
	}

	const defaultFunctionNamespaceUri =
		options['defaultFunctionNamespaceURI'] === undefined
			? BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI
			: options['defaultFunctionNamespaceURI'];

	const codegenContext = new CodeGenContext(
		options['namespaceResolver'] || createDefaultNamespaceResolver(null),
		defaultFunctionNamespaceUri,
	);

	annotateAst(
		ast,
		new AnnotationContext(
			new StaticContext(
				new ExecutionSpecificStaticContext(
					codegenContext.resolveNamespace,
					{},
					defaultFunctionNamespaceUri,
					options['functionNameResolver'] ||
						createDefaultFunctionNameResolver(
							BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
						),
				),
			),
		),
	);

	return compileAstToJavaScript(ast, returnType, codegenContext);
}

export default compileXPathToJavaScript;
