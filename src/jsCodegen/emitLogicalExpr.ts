import { ValueType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitOperand } from './emitOperand';
import {
	acceptAst,
	CompiledResultType,
	FunctionIdentifier,
	PartialCompilationResult,
} from './JavaScriptCompiledXPath';

/**
 * Helper function to compile an and expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns Wrapped and expression.
 */
export function emitAndExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '&&');
}

/**
 * Helper function to compile an or expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns Wrapped or expression.
 */
export function emitOrExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	return emitLogicalExpr(ast, identifier, staticContext, '||');
}

/**
 * Compiles the and and or logical expressions to a JavaScript function.
 *
 * https://www.w3.org/TR/xpath-31/#id-logical-expressions
 *
 * @param ast Logical expression AST node.
 * @param identifier Function identifier for the emitted function
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @param logicalExprOperator The exact operator that will be compiled. Can be either && or ||.
 * @returns Wrapped logical expression.
 */
function emitLogicalExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext,
	logicalExprOperator: '&&' | '||'
): PartialCompilationResult {
	const firstExpr = emitOperand(
		ast,
		identifier,
		'firstOperand',
		staticContext,
		ValueType.XSBOOLEAN
	);
	if (!firstExpr.isAstAccepted) {
		return firstExpr;
	}

	const secondExpr = emitOperand(
		ast,
		identifier,
		'secondOperand',
		staticContext,
		ValueType.XSBOOLEAN
	);
	if (!secondExpr.isAstAccepted) {
		return secondExpr;
	}

	const logicalOpCode = `
	function ${identifier}(contextItem) {
		${firstExpr.variables.join('\n')}
		${secondExpr.variables.join('\n')}
		return ${firstExpr.code} ${logicalExprOperator} ${secondExpr.code}
	}
	`;
	return acceptAst(logicalOpCode, CompiledResultType.Function);
}
