import { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitCompareExpr } from './emitCompare';
import { emitFunctionCallExpr } from './emitFunctionCallExpr';
import { emitStringLiteralExpression } from './emitLiterals';
import { emitAndExpr, emitOrExpr } from './emitLogicalExpr';
import { baseExprAstNodes, baseExpressions } from './emitOperand';
import { emitPathExpr } from './emitPathExpr';
import {
	acceptAst,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';

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
		// generalCompare
		case baseExprAstNodes.EQUAL_OP:
		case baseExprAstNodes.NOT_EQUAL_OP:
		case baseExprAstNodes.LESS_THAN_OR_EQUAL_OP:
		case baseExprAstNodes.LESS_THAN_OP:
		case baseExprAstNodes.GREATER_THAN_OR_EQUAL_OP:
		case baseExprAstNodes.GREATER_THAN_OP:
		// valueCompare
		case baseExprAstNodes.EQ_OP:
		case baseExprAstNodes.NE_OP:
		case baseExprAstNodes.LT_OP:
		case baseExprAstNodes.LE_OP:
		case baseExprAstNodes.GT_OP:
		case baseExprAstNodes.GE_OP:
		case baseExprAstNodes.IS_OP:
		// nodeCompare
		case baseExprAstNodes.NODE_BEFORE_OP:
		case baseExprAstNodes.NODE_AFTER_OP:
			return emitCompareExpr(ast, identifier, staticContext, name);
		case baseExprAstNodes.FUNCTION_CALL_EXPR:
			return emitFunctionCallExpr(ast, identifier, staticContext);
		default:
			return rejectAst(`Unsupported: the base expression '${name}'.`);
	}
}
