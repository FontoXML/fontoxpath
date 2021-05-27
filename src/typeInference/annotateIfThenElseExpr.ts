import { SequenceType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateIfThenElseExpr(
	ast: IAST,
	elseClause: SequenceType,
	thenClause: SequenceType
): SequenceType {
	if (!elseClause || !thenClause) {
		return undefined;
	}
	if (elseClause.type === thenClause.type && elseClause.mult === thenClause.mult) {
		astHelper.insertAttribute(ast, 'type', elseClause);
		return elseClause;
	}
	return undefined;
}
