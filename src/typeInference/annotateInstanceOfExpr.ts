import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Insert type boolean multiplicity exactly one the type to the ast
 * as an attribute, since instance of expression evaluates to a boolean.
 *
 * @param ast the AST to be annotated.
 * @returns the type of the context item.
 */
export function annotateInstanceOfExpr(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
