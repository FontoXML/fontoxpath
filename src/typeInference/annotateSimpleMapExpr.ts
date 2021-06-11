import { SequenceType } from '../expressions/dataTypes/Value';
import { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './AnnotationContext';

/**
 * A simpleMapExpr is a .map() function, so it checks the type of the input,
 * and with the scope and the further annotations, then inferres the type.
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotateSimpleMapExpr(ast: IAST, context: AnnotationContext): SequenceType {
	// const seqType = {
	// 	type: ValueType.MAP,
	// 	mult: SequenceMultiplicity.EXACTLY_ONE,
	// };

	// astHelper.insertAttribute(ast, 'type', seqType);
	// return seqType;
	return undefined;
}
