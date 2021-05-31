import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';
import { AnnotationContext } from './annotateAST';

/**
 * Inserts an item* type to the AST, as sequence operator can contain multiple different ITEM types.
 * The actual types are stores in the children nodes.
 * @param ast the AST to be annotated.
 * @returns `SequenceType` of type ITEM with multiplicity of `ZERO_OR_MORE` or undefined in case we have an empty sequence.
 */
export function annotateSequenceOperator(
	ast: IAST,
	length: number,
	context: AnnotationContext
): SequenceType {
	let seqType;

	if (length === 0) {
		// We have an empty sequence here
		seqType = {
			type: ValueType.NODE,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	} else {
		seqType = {
			type: ValueType.ITEM,
			mult: SequenceMultiplicity.ZERO_OR_MORE,
		};
	}

	context.totalAnnotated[context.totalAnnotated.length - 1]++;
	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
