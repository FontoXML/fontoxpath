import {
	SequenceMultiplicity,
	SequenceType,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateCastOperator(ast: IAST): SequenceType | undefined {
	const targetTypeString = getTargetTypeFromAST(ast);
	const targetValueType = stringToValueType(targetTypeString);
	const sequenceType = { type: targetValueType, mult: SequenceMultiplicity.EXACTLY_ONE };
	astHelper.insertAttribute(ast, 'type', sequenceType);
	return sequenceType;
}

export function annotateCastableOperator(ast: IAST): SequenceType {
	const sequenceType = { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE };
	astHelper.insertAttribute(ast, 'type', sequenceType);
	return sequenceType;
}

function getTargetTypeFromAST(ast: IAST): string {
	const typeInfoNode = astHelper.followPath(ast, ['singleType', 'atomicType']);
	const prefix = astHelper.getAttribute(typeInfoNode, 'prefix');
	const targetType = typeInfoNode[2];

	return prefix + ':' + targetType;
}
