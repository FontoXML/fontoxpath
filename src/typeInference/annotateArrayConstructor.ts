import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

export function annotateArrayConstructor(ast: IAST): SequenceType {
	const seqType = {
		type: ValueType.ARRAY,
		mult: SequenceMultiplicity.EXACTLY_ONE,
	};

	astHelper.insertAttribute(ast, 'type', seqType);

	return seqType;
}
