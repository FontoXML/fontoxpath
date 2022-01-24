import astHelper, { IAST } from '../parsing/astHelper';
import escapeJavaScriptString from './escapeJavaScriptString';
import {
	acceptAst,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	PartialCompilationResult,
} from './JavaScriptCompiledXPath';

/**
 * Create a JavaScript function that returns the string literal.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-StringLiteral
 *
 * @param ast The string literal AST node
 * @param identifier The function wrapper identifier
 * @returns Wrapped string literal function
 */
export function emitStringLiteralExpression(
	ast: IAST,
	identifier: FunctionIdentifier
): PartialCompilationResult {
	// Note: default the value to the emptyy string. The XQueryX roundtrip may omit them
	let text = (astHelper.getFirstChild(ast, 'value')[1] as string) || '';
	text = escapeJavaScriptString(text);
	return acceptAst(`const ${identifier} = ${text};`, { type: GeneratedCodeBaseType.Variable });
}
