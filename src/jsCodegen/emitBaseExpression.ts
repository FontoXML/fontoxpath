import { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitCompareExpr } from './emitCompare';
import { emitFunctionCallExpr } from './emitFunctionCallExpr';
import { emitStringLiteralExpression } from './emitLiterals';
import { emitAndExpr, emitOrExpr } from './emitLogicalExpr';
import { baseExprAstNodes } from './emitOperand';
import { emitPathExpr } from './emitPathExpr';
import { FunctionIdentifier, PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

/**
 * Compile AST to base expression wrapped in a function named as the given identifier.
 *
 * @param ast The AST node to compile into a function.
 * @param identifier The function identifier.
 * @param staticContext Static context parameter to retrieve context-dependent information.
 * @returns If the AST node's expression is supported for compilation, a wrapped JavaScript function.
 * If unsupported, a wrapped error message.
 */
export function emitBaseExpr(
	ast: IAST,
	identifier: FunctionIdentifier,
	staticContext: CodeGenContext
): PartialCompilationResult {
	const name = ast[0];

	switch (name) {
		case baseExprAstNodes.PATH_EXPR:
			return emitPathExpr(ast, identifier, staticContext);
		case baseExprAstNodes.AND_OP:
			return emitAndExpr(ast, identifier, staticContext);
		case baseExprAstNodes.OR_OP:
			return emitOrExpr(ast, identifier, staticContext);
		case baseExprAstNodes.STRING_LIT_EXPR:
			return emitStringLiteralExpression(ast, identifier);
		case baseExprAstNodes.FUNCTIONCALLEXPR:
			return emitFunctionCallExpr(ast, identifier, staticContext);
		// generalCompare
		case 'equalOp':
		case 'notEqualOp':
		case 'lessThanOrEqualOp':
		case 'lessThanOp':
		case 'greaterThanOrEqualOp':
		case 'greaterThanOp':
		// valueCompare
		case 'eqOp':
		case 'neOp':
		case 'ltOp':
		case 'leOp':
		case 'gtOp':
		case 'geOp':
		case 'isOp':
		// nodeCompare
		case 'nodeBeforeOp':
		case 'nodeAfterOp':
			return emitCompareExpr(ast, identifier, staticContext, name);
		default:
			return rejectAst(`Unsupported: the base expression '${name}'.`);
	}
}
