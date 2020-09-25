import builtinDataTypesByName from './builtins/builtinDataTypesByName';

import AtomicValue from './AtomicValue';
import { ValueType } from './Value';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByName[type]) {
		throw new Error('Unknown type');
	}

	return {
		type,
		value,
	};
}

export const trueBoolean = createAtomicValue(true, 'xs:boolean');
export const falseBoolean = createAtomicValue(false, 'xs:boolean');
