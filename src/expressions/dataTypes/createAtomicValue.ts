import AtomicValue from './AtomicValue';
import builtinDataTypesByType from './builtins/builtinDataTypesByType';
import isSubtypeOf from './isSubtypeOf';
import { ValueType } from './Value';
import { Decimal } from './valueTypes/Decimal';

export default function createAtomicValue(value: any, type: ValueType): AtomicValue {
	if (!builtinDataTypesByType[type]) {
		throw new Error('Unknown type');
	}

	if (isSubtypeOf(type, ValueType.XSDECIMAL)) {
		return {
			type,
			value: Decimal.coerce(value),
		};
	}

	return {
		type,
		value,
	};
}

export const trueBoolean = createAtomicValue(true, ValueType.XSBOOLEAN);
export const falseBoolean = createAtomicValue(false, ValueType.XSBOOLEAN);
