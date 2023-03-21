import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Concatenates two strings to each other, hence it always returns a string.
 *
 * @param ast the AST to be annotated.
 * @param context
 * @returns a SequenceType with type XSSTRING and multiplicity EXACTLY_ONE.
 */
export function annotateStringConcatenateOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSSTRING,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
