import AtomicValue from './AtomicValue';
import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import Value, { SequenceMultiplicity, ValueType } from './Value';

export default function promoteToType(value: Value, type: ValueType): AtomicValue {
	if (isSubtypeOf(value.type, ValueType.XSNUMERIC)) {
		if (isSubtypeOf(value.type, ValueType.XSFLOAT)) {
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(value.value, ValueType.XSDOUBLE);
			}
			return null;
		}
		if (isSubtypeOf(value.type, ValueType.XSDECIMAL)) {
			if (type === ValueType.XSFLOAT) {
				return createAtomicValue(value.value,  ValueType.XSFLOAT);
			}
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(value.value, ValueType.XSDOUBLE);
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
