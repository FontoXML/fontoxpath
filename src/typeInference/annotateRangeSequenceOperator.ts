import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateRangeSequenceOperator(
	ast: IAST,
	start: SequenceType,
	end: SequenceType
): SequenceType {
	if (!start || !end) return undefined;

	// TODO: add check to see if start is an integer and end is an integer and start > end --> return undefined
	// TODO: add check to see if start is an integer and end is an integer and start == end --> return XSINTEGER

	const seqType = {
		type: ValueType.XSINTEGER,
		mult: SequenceMultiplicity.ONE_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
