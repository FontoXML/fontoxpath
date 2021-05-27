import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

export function annotateIfThenElseExpr(
	ast: IAST,
	ifClause: SequenceType,
	elseClause: SequenceType,
	thenClause: SequenceType
): SequenceType {
	if (elseClause === thenClause) return elseClause;
	else return undefined;
}
