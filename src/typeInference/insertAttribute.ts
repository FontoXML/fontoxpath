import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';

export function insertAttribute(ast: IAST, name: string, data: any): IAST {
	if (typeof ast[1] === 'object' && !Array.isArray(ast[1])) {
		ast[1][name] = data;
	} else {
		const obj = {};
		obj[name] = data;
		ast.splice(1, 0, obj);
	}

	return ast;
}
