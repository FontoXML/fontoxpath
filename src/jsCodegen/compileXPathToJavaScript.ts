import { EvaluableExpression } from '../evaluateXPath';
import {
	createDefaultFunctionNameResolver,
	createDefaultNamespaceResolver,
} from '../evaluationUtils/buildEvaluationContext';
import ExecutionSpecificStaticContext from '../expressions/ExecutionSpecificStaticContext';
import { BUILT_IN_NAMESPACE_URIS } from '../expressions/staticallyKnownNamespaces';
import StaticContext from '../expressions/StaticContext';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import convertXmlToAst from '../parsing/convertXmlToAst';
import normalizeEndOfLines from '../parsing/normalizeEndOfLines';
import parseExpression from '../parsing/parseExpression';
import annotateAst from '../typeInference/annotateAST';
import { AnnotationContext } from '../typeInference/AnnotationContext';
import { Language, Options } from '../types/Options';
import { CodeGenContext } from './CodeGenContext';
import compileAstToJavaScript from './compileAstToJavaScript';
import { JavaScriptCompiledXPathResult } from './JavaScriptCompiledXPath';

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
	options?: Options | null
): JavaScriptCompiledXPathResult {
	options = options || {};
	returnType = returnType || (ReturnType.ANY as any);

	let ast;
	if (typeof selector === 'string') {
		const expressionString = normalizeEndOfLines(selector);
		const parserOptions = {
			allowXQuery:
				options['language'] === Language.XQUERY_3_1_LANGUAGE ||
				options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
			// Debugging inserts xs:stackTrace in the AST, but this is not supported
			// yet by the js-codegen backend.
			debug: false,
		};

		ast = parseExpression(expressionString, parserOptions);
	} else {
		ast = convertXmlToAst(selector);
	}

	const codegenContext: CodeGenContext = {
		resolveNamespace: options['namespaceResolver'] || createDefaultNamespaceResolver(null),
	};

	annotateAst(
		ast,
		new AnnotationContext(
			new StaticContext(
				new ExecutionSpecificStaticContext(
					codegenContext.resolveNamespace,
					{},
					options['defaultFunctionNamespaceURI'] ||
						BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
					createDefaultFunctionNameResolver(
						BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI
					)
				)
			)
		)
	);

	return compileAstToJavaScript(ast, returnType, codegenContext);
}

export default compileXPathToJavaScript;
