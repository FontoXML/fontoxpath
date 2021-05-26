import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotatePathExpr(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.NODE,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);
	return seqType;
}
