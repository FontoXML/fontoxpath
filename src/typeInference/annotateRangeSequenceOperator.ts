import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

/**
 * Inserts an integer sequence into the AST for the rangeSequenceExpr node.
 *
 * @param ast the AST to be annotated.
 * @returns an integer sequence.
 */
export function annotateRangeSequenceOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.ONE_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
