import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateAndOperator(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.XSBOOLEAN,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
