import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Annotate the ast by inserting boolean sequence type of exactly one multiplicity.
 * Quantified Expression evaluates if a statement satisfies the quantifier;
 * therefore its value is a boolean.
 *
 * @param ast the ast node to be annotated.
 * @returns the annotated sequence type.
 */
export function annotateQuantifiedExpr(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
