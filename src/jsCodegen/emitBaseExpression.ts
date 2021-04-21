import { IAST } from '../parsing/astHelper';
import { emitAndExpression, emitOrExpression } from './emitLogicExpression';
import emitPathExpression from './emitPathExpression';

export const baseExpressionNames = {
	PATH_EXPR: 'pathExpr',
	AND_OP: 'andOp',
	OR_OP: 'orOp',
};

export const baseExpressions = Object.values(baseExpressionNames);

const baseEmittersByExpression = {
	[baseExpressionNames.PATH_EXPR]: emitPathExpression,
	[baseExpressionNames.AND_OP]: emitAndExpression,
	[baseExpressionNames.OR_OP]: emitOrExpression,
};

export function emitBaseExpression(ast: IAST, identifier: string): string {
	const name = ast[0];
	const baseExpressionToEmit = baseEmittersByExpression[name];
	if (baseExpressionToEmit === undefined) {
		throw new Error(`Unsupported: base expression ${name}`);
	}
	return baseExpressionToEmit(ast, identifier);
}
