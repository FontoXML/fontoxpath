import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Inserting the array type of multiplicity exactly one to the ast;
 * as the return type of the array constructor is array.
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotateArrayConstructor(ast: IAST, context: AnnotationContext): SequenceType {
	const seqType = {
		type: ValueType.ARRAY,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
