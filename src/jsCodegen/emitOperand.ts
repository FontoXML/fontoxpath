import { ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { CodeGenContext } from './CodeGenContext';
import {
	acceptAst,
	CompiledResultType,
	FunctionIdentifier,
	GeneratedCodeBaseType,
	getCompiledValueCode,
	PartialCompilationResult,
	rejectAst,
} from './JavaScriptCompiledXPath';
import { determinePredicateTruthValue } from './runtimeLib';

export const baseExprAstNodes = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
	STRING_LIT_EXPR: 'stringConstantExpr',
	EQUAL_OP: 'equalOp',
	NOT_EQUAL_OP: 'notEqualOp',
	LESS_THAN_OR_EQUAL_OP: 'lessThanOrEqualOp',
	LESS_THAN_OP: 'lessThanOp',
	GREATER_THAN_OR_EQUAL_OP: 'greaterThanOrEqualOp',
	GREAtER_THAN_OP: 'greaterThanOp',
	// valueCompare
	EQ_OP: 'eqOp',
	NE_OP: 'neOp',
	LT_OP: 'ltOp',
	LE_OP: 'leOp',
	GT_OP: 'gtOp',
	GE_OP: 'geOp',
	IS_OP: 'isOp',
	// nodeCompare
	NODE_BEFORE_OP: 'nodeBeforeOp',
	NODE_AFTER_OP: 'nodeAfterOp',
};

export const baseExpressions = Object.values(baseExprAstNodes);

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
	identifier: FunctionIdentifier,
	operandKind: 'firstOperand' | 'secondOperand',
	staticContext: CodeGenContext,
	targetType?: ValueType
): PartialCompilationResult {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const exprAst = astHelper.getFirstChild(operand, baseExpressions);
	if (!exprAst) {
		return rejectAst('Unsupported: a base expression used with an operand.');
	}

	const baseExprIdentifier = identifier + operandKind;

	const baseExpr = staticContext.emitBaseExpr(exprAst, baseExprIdentifier, staticContext);
	if (!baseExpr.isAstAccepted) {
		return baseExpr;
	}

	if (targetType === ValueType.XSBOOLEAN) {
		return determinePredicateTruthValue(
			baseExprIdentifier,
			baseExpr.code,
			baseExpr.generatedCodeType
		);
	}
	return acceptAst(`${baseExprIdentifier}`, baseExpr.generatedCodeType, [baseExpr.code]);
}
