import AtomicValue from './AtomicValue';
import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import { SequenceMultiplicity, ValueType } from './Value';

export default function promoteToType(value, type: ValueType): AtomicValue {
	if (isSubtypeOf(value.type.kind, ValueType.XSNUMERIC)) {
		if (isSubtypeOf(value.type.kind, ValueType.XSFLOAT)) {
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(value.value, ValueType.XSDOUBLE);
			}
			return null;
		}
		if (isSubtypeOf(value.type.kind, ValueType.XSDECIMAL)) {
			if (type === ValueType.XSFLOAT) {
				return createAtomicValue(value.value,  ValueType.XSFLOAT);
			}
			if (type === ValueType.XSDOUBLE) {
				return createAtomicValue(value.value, ValueType.XSDOUBLE);
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type.kind, ValueType.XSANYURI)) {
		if (type === ValueType.XSSTRING) {
			return createAtomicValue(value.value, ValueType.XSSTRING);
		}
	}
	return null;
}
