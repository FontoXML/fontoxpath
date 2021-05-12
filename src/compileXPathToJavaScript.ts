import { normalizeEndOfLines } from './evaluationUtils/buildEvaluationContext';
import compileAstToJavaScript from './jsCodegen/compileAstToJavaScript';
import { JavaScriptCompiledXPathResult } from './jsCodegen/JavaScriptCompiledXPath';
import { ReturnType } from './parsing/convertXDMReturnValue';
import parseExpression from './parsing/parseExpression';
import { Language, Options } from './types/Options';

/**
 * Compile a given query to JavaScript code. For executing compiled code, see
 * {@link executeJavaScriptCompiledXPath}.
 *
 * @beta
 *
 * @param selector - The selector to compile. @param returnType - One of the return types indicating the value to be returned when executing the query.
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
		allowUpdating: options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		allowXQuery:
			options['language'] === Language.XQUERY_3_1_LANGUAGE ||
			options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		debug: !!options['debug'],
	};

	const ast = parseExpression(expressionString, parserOptions);

	return compileAstToJavaScript(ast, returnType);
}

export default compileXPathToJavaScript;
