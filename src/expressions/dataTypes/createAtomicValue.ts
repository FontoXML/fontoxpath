import builtinDataTypesByName from './builtins/builtinDataTypesByName';

import AtomicValue from './AtomicValue';
import { BaseType, ValueType } from './Value';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByName[type.kind]) {
		throw new Error('Unknown type');
	}

	return {
		type,
		value,
	};
}

export const trueBoolean = createAtomicValue(true, { kind: BaseType.XSBOOLEAN });
export const falseBoolean = createAtomicValue(false, { kind: BaseType.XSBOOLEAN });
