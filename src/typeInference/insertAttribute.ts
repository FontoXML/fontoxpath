import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

export function insertAttribute(ast: IAST, sequenceType: SequenceType): IAST {
	if (typeof ast[1] === 'object' && !Array.isArray(ast[1])) {
		ast[1]['type'] = sequenceType;
	} else {
		ast.splice(1, 0, { type: sequenceType });
	}

	return ast;
}
