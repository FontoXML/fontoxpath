import {
	SequenceMultiplicity,
	SequenceType,
	stringToValueType,
} from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { insertAttribute } from './insertAttribute';

export function annotateCastOperators(ast: IAST): SequenceType | undefined {
	// when ast is not annotated, ast[2] goes to the singleType, ast[2][1] the atomicType
	// ast[2][1][1]['prefix'] the prefix 'xs' and then ast[2][1][2] is the targetType
	const targetTypeFromAST = ast[2][1][1]['prefix'] + ':' + ast[2][1][2];
	const valueType = stringToValueType(targetTypeFromAST);
	const sequenceType = { type: valueType, mult: SequenceMultiplicity.EXACTLY_ONE };
	insertAttribute(ast, 'type', sequenceType);
	return sequenceType;
}
