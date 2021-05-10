import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';

export default function isSameMapKey(k1: Value, k2: Value): boolean {
	const k1IsStringLike =
		isSubtypeOf(k1.type, ValueType.XSSTRING) ||
		isSubtypeOf(k1.type, ValueType.XSANYURI) ||
		isSubtypeOf(k1.type, ValueType.XSUNTYPEDATOMIC);
	const k2IsStringLike =
		isSubtypeOf(k2.type, ValueType.XSSTRING) ||
		isSubtypeOf(k2.type, ValueType.XSANYURI) ||
		isSubtypeOf(k2.type, ValueType.XSUNTYPEDATOMIC);

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	const k1IsNumeric =
		isSubtypeOf(k1.type, ValueType.XSDECIMAL) ||
		isSubtypeOf(k1.type, ValueType.XSDOUBLE) ||
		isSubtypeOf(k1.type, ValueType.XSFLOAT);
	const k2IsNumeric =
		isSubtypeOf(k2.type, ValueType.XSDECIMAL) ||
		isSubtypeOf(k2.type, ValueType.XSDOUBLE) ||
		isSubtypeOf(k2.type, ValueType.XSFLOAT);
	if (k1IsNumeric && k2IsNumeric) {
		if (isNaN(k1.value) && isNaN(k2.value)) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	const k1IsOther =
		isSubtypeOf(k1.type, ValueType.XSBOOLEAN) ||
		isSubtypeOf(k1.type, ValueType.XSHEXBINARY) ||
		isSubtypeOf(k1.type, ValueType.XSDURATION) ||
		isSubtypeOf(k1.type, ValueType.XSQNAME) ||
		isSubtypeOf(k1.type, ValueType.XSNOTATION);
	const k2IsOther =
		isSubtypeOf(k2.type, ValueType.XSBOOLEAN) ||
		isSubtypeOf(k2.type, ValueType.XSHEXBINARY) ||
		isSubtypeOf(k2.type, ValueType.XSDURATION) ||
		isSubtypeOf(k2.type, ValueType.XSQNAME) ||
		isSubtypeOf(k2.type, ValueType.XSNOTATION);
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
