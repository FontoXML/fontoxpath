import { Bucket } from '../expressions/util/Bucket';
import { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import { emitCompareExpr } from './emitCompare';
import { emitFunctionCallExpr } from './emitFunctionCallExpr';
import { emitStringConstantExpr } from './emitLiterals';
import { emitAndExpr, emitOrExpr } from './emitLogicalExpr';
import { emitPathExpr } from './emitPathExpr';
import { PartialCompilationResult, rejectAst } from './JavaScriptCompiledXPath';

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
	contextItemExpr: PartialCompilationResult,
	context: CodeGenContext
): [PartialCompilationResult, Bucket] {
	const name = ast[0];

	switch (name) {
		case 'contextItemExpr':
			return [contextItemExpr, null];
		case 'pathExpr':
			return emitPathExpr(ast, contextItemExpr, context);
		case 'andOp':
			return emitAndExpr(ast, contextItemExpr, context);
		case 'orOp':
			return emitOrExpr(ast, contextItemExpr, context);
		case 'stringConstantExpr':
			return emitStringConstantExpr(ast);
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
			return [emitCompareExpr(ast, name, contextItemExpr, context), null];
		case 'functionCallExpr':
			return [emitFunctionCallExpr(ast, contextItemExpr, context), null];
		default:
			return [rejectAst(`Unsupported: the base expression '${name}'.`), null];
	}
}
