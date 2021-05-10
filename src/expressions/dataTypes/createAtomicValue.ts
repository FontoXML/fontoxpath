import AtomicValue from './AtomicValue';
import builtinDataTypesByType from './builtins/builtinDataTypesByType';
import { ValueType } from './Value';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByType[type]) {
		throw new Error('Unknown type');
	}

	return {
		type,
		value,
	};
}

export const trueBoolean = createAtomicValue(true, ValueType.XSBOOLEAN);
export const falseBoolean = createAtomicValue(false, ValueType.XSBOOLEAN);
