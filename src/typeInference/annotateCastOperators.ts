import {
	SequenceMultiplicity,
	SequenceType,
	stringToValueType,
	ValueType,
} from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * Read the target type of the cast operator from the AST and
 * inserts it to as new attribute `type` to the AST.
 *
 * @param ast the AST to be annotated
 * @returns the inferred type
 */
export function annotateCastOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const targetTypeString = getTargetTypeFromAST(ast);
	const targetValueType = stringToValueType(targetTypeString);
	const sequenceType = { type: targetValueType, mult: SequenceMultiplicity.EXACTLY_ONE };

	astHelper.insertAttribute(ast, 'type', sequenceType);
	return sequenceType;
}

/**
 * Inserts a boolean type to the AST, as castable operator returns boolean type.
 *
 * @param ast the AST to be annotated
 * @returns `SequenceType` of type boolean and multiplicity of `Exactly_ONE`
 */
export function annotateCastableOperator(ast: IAST, context: AnnotationContext): SequenceType {
	const sequenceType = { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE };

	astHelper.insertAttribute(ast, 'type', sequenceType);
	return sequenceType;
}

/**
 * Helper function that reads the target type of the cast operator from AST.
 */
function getTargetTypeFromAST(ast: IAST): string {
	const typeInfoNode = astHelper.followPath(ast, ['singleType', 'atomicType']);
	const prefix = astHelper.getAttribute(typeInfoNode, 'prefix');
	const targetType = typeInfoNode[2];

	return prefix + ':' + targetType;
}
