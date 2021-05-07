import AtomicValue from './AtomicValue';
import { BaseType } from './BaseType';
import builtinDataTypesByType from './builtins/builtinDataTypesByType';
import { SequenceType, ValueType } from './Value';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByType[type.kind]) {
		throw new Error('Unknown type');
	}

	return {
		type,
		value,
	};
}

export const trueBoolean = createAtomicValue(true, {
	kind: BaseType.XSBOOLEAN,
	seqType: SequenceType.EXACTLY_ONE,
});
export const falseBoolean = createAtomicValue(false, {
	kind: BaseType.XSBOOLEAN,
	seqType: SequenceType.EXACTLY_ONE,
});
