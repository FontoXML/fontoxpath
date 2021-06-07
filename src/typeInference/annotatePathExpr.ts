import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Inserting the node type of multiplicity zero or more to the ast;
 * as the path expr evaluates to a node.
 *
 * @param ast the AST to be annotated.
 * @returns the inferred SequenceType
 */
export function annotatePathExpr(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
