import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { insertAttribute } from './insertAttribute';

export function annotateFunctionCall(
	ast: IAST,
	valueType: SequenceType | undefined
): SequenceType | undefined {
	if (!valueType) {
		return undefined;
	}

	const type = {
		type: valueType.type,
		mult: valueType.mult,
	};

	insertAttribute(ast, 'type', type);
	return type;
}
