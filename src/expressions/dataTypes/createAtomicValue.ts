import builtinDataTypesByType from './builtins/builtinDataTypesByType';

import AtomicValue from './AtomicValue';
import { BaseType, SequenceType, ValueType } from './Value';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByType[type.kind]) {
		throw new Error('Unknown type');
	}

	return <AtomicValue>{
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
