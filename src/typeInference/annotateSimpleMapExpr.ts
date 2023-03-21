import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * A simpleMapExpr is a .map() function, so it checks the type of the input,
 * and with the scope and the further annotations, then inferres the type.
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotateSimpleMapExpr(
	ast: IAST,
	context: AnnotationContext,
	lastType: SequenceType
): SequenceType {
	if (lastType !== undefined && lastType !== null) {
		const sequenceType: SequenceType = {
			type: lastType.type,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
		if (sequenceType && sequenceType.type !== ValueType.ITEM) {
			astHelper.insertAttribute(ast, 'type', sequenceType);
		}
		return sequenceType;
	} else {
		return { type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE };
	}
}
