import { normalizeEndOfLines } from './evaluationUtils/buildEvaluationContext';
import compileAstToJavaScript from './jsCodegen/compileAstToJavaScript';
import { CompiledJavaScriptResult } from './jsCodegen/CompiledJavaScript';
import { ReturnType } from './parsing/convertXDMReturnValue';
import parseExpression from './parsing/parseExpression';
import { Language, Options } from './types/Options';

function compileXPathToJavaScript(
	selector: string,
	returnType?: ReturnType,
	options?: Options | null
): CompiledJavaScriptResult {
	options = options || {};

	returnType = returnType || (ReturnType.ANY as any);
	if (!selector || typeof selector !== 'string') {
		throw new TypeError("Failed to execute 'evaluateXPath': xpathExpression must be a string.");
	}

	const expressionString = normalizeEndOfLines(selector);

	const compilationOptions = {
		allowUpdating: options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		allowXQuery:
			options['language'] === Language.XQUERY_3_1_LANGUAGE ||
			options['language'] === Language.XQUERY_UPDATE_3_1_LANGUAGE,
		debug: !!options['debug'],
	};

	const ast = parseExpression(expressionString, compilationOptions);

	return compileAstToJavaScript(ast, returnType);
}

export default compileXPathToJavaScript;
