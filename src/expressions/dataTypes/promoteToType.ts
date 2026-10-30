import AtomicValue from './AtomicValue';
import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import Value, { ValueType } from './Value';
import { Decimal } from './valueTypes/Decimal';

export default function promoteToType(value: Value, type: ValueType): AtomicValue {
	if (isSubtypeOf(value.type, ValueType.XSNUMERIC)) {
		if (isSubtypeOf(value.type, ValueType.XSFLOAT)) {
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(value.value, ValueType.XSDOUBLE);
			}
			return null;
		}
		if (isSubtypeOf(value.type, ValueType.XSDECIMAL)) {
			const floatValue = value.value instanceof Decimal ? value.value.toFloat() : value.value;
			if (type === ValueType.XSFLOAT) {
				return createAtomicValue(floatValue, ValueType.XSFLOAT);
			}
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(floatValue, ValueType.XSDOUBLE);
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type, ValueType.XSANYURI)) {
		if (type === ValueType.XSSTRING) {
			return createAtomicValue(value.value, ValueType.XSSTRING);
		}
	}
	return null;
}
