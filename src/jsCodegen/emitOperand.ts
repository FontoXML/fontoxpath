import { Bucket } from '../expressions/util/Bucket';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitBaseExpr } from './emitBaseExpr';
import { PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

/**
 * Retrieves the first or second operand for an operator AST node and wraps
 * it in a function.
 *
 * @param ast Base AST node for which get either the first or second operand.
 * @param identifier Function identifier for the emitted code.
 * @param operandKind Indicates if it's the first or second operand for an operator.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns JavaScript code of the operand.
 */
export function emitOperand(
	ast: IAST,
	operandKind: 'firstOperand' | 'secondOperand',
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	const exprAst = astHelper.followPath(ast, [operandKind, '*']);
	if (!exprAst) {
		return [rejectAst(`${operandKind} expression not found`), null];
	}

	return emitBaseExpr(exprAst, contextItemExpr, context);
}
