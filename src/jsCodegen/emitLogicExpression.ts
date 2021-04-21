import astHelper, { IAST } from '../parsing/astHelper';
import { baseExpressions, emitBaseExpression } from './emitBaseExpression';

const firstOp = 'firstOperand';
const secondOp = 'secondOperand';

function emitCompiledOperand(ast: IAST, identifier: string, operandKind: string) {
	const operand = astHelper.getFirstChild(ast, operandKind);
	const expressionAst = astHelper.getFirstChild(operand, baseExpressions);

	const expressionIdentifier = identifier + operandKind;

	const compiledExpression = emitBaseExpression(expressionAst, expressionIdentifier);

	return {
		fnCall: `determinePredicateTruthValue(${expressionIdentifier}(contextItem))`,
		code: compiledExpression,
	};
}

function emitCompiledOperands(ast: IAST, identifier: string) {
	return [
		emitCompiledOperand(ast, identifier, firstOp),
		emitCompiledOperand(ast, identifier, secondOp),
	];
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-AndExpr
export function emitAndExpression(ast: IAST, identifier: string): string {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const andOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.code}
		${secondCompiledExpression.code}
		return ${firstCompiledExpression.fnCall} && ${secondCompiledExpression.fnCall}
	}
	`;
	return andOpCode;
}

// https://www.w3.org/TR/xpath-31/#doc-xpath31-OrExpr
export function emitOrExpression(ast: IAST, identifier: string): string {
	const [firstCompiledExpression, secondCompiledExpression] = emitCompiledOperands(
		ast,
		identifier
	);

	const orOpCode = `
	function ${identifier}(contextItem) {
		${firstCompiledExpression.code}
		${secondCompiledExpression.code}
		return ${firstCompiledExpression.fnCall} || ${secondCompiledExpression.fnCall}
	}
	`;
	return orOpCode;
}
