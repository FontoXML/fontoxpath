import {
	createDefaultNamespaceResolver,
	normalizeEndOfLines,
} from '../evaluationUtils/buildEvaluationContext';
import { ReturnType } from '../parsing/convertXDMReturnValue';
import parseExpression from '../parsing/parseExpression';
import { Language, Options } from '../types/Options';
import compileAstToJavaScript from './compileAstToJavaScript';
import { JavaScriptCompiledXPathResult } from './JavaScriptCompiledXPath';
import { StaticContext } from './StaticContext';
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
	selector: string,
	returnType?: ReturnType,
	options?: Options | null
): JavaScriptCompiledXPathResult {
	options = options || {};
	returnType = returnType || (ReturnType.ANY as any);

	const expressionString = normalizeEndOfLines(selector);

	const parserOptions = {
		allowXQuery:
			options['language'] === Language.XQUERY_3_1_LANGUAGE ||
			options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		// Debugging inserts xs:stackTrace in the AST, but this is not supported
		// yet by the js-codegen backend.
		debug: false,
	};

	const ast = parseExpression(expressionString, parserOptions);

	const staticContext: StaticContext = {
		resolveNamespace: options['namespaceResolver'] || createDefaultNamespaceResolver(null),
	};

	// const annotatedAst = annotateAst(ast, new AnnotationContext(staticContext));

	return compileAstToJavaScript(ast, returnType, staticContext);
}

export default compileXPathToJavaScript;
