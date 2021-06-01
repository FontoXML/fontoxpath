import { SequenceMultiplicity, SequenceType, ValueType } from '../expressions/dataTypes/Value';
import astHelper, { IAST } from '../parsing/astHelper';

// TODO: Annotation not yet implemented. How to lookup the NCName and get the type to be returned.
export function annotateUnaryLookup(ast: IAST, ncName: IAST): SequenceType {
	const itemReturn = {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_MORE,
	};
	astHelper.insertAttribute(ast, 'type', itemReturn);
	return itemReturn;
}
