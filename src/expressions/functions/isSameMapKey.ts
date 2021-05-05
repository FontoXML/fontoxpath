import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';

export default function isSameMapKey(k1: Value, k2: Value): boolean {
	const k1IsStringLike =
		isSubtypeOf(k1.type.kind, BaseType.XSSTRING) ||
		isSubtypeOf(k1.type.kind, BaseType.XSANYURI) ||
		isSubtypeOf(k1.type.kind, BaseType.XSUNTYPEDATOMIC);
	const k2IsStringLike =
		isSubtypeOf(k2.type.kind, BaseType.XSSTRING) ||
		isSubtypeOf(k2.type.kind, BaseType.XSANYURI) ||
		isSubtypeOf(k2.type.kind, BaseType.XSUNTYPEDATOMIC);

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	const k1IsNumeric =
		isSubtypeOf(k1.type.kind, BaseType.XSDECIMAL) ||
		isSubtypeOf(k1.type.kind, BaseType.XSDOUBLE) ||
		isSubtypeOf(k1.type.kind, BaseType.XSFLOAT);
	const k2IsNumeric =
		isSubtypeOf(k2.type.kind, BaseType.XSDECIMAL) ||
		isSubtypeOf(k2.type.kind, BaseType.XSDOUBLE) ||
		isSubtypeOf(k2.type.kind, BaseType.XSFLOAT);
	if (k1IsNumeric && k2IsNumeric) {
		if (isNaN(k1.value) && isNaN(k2.value)) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	const k1IsOther =
		isSubtypeOf(k1.type.kind, BaseType.XSBOOLEAN) ||
		isSubtypeOf(k1.type.kind, BaseType.XSHEXBINARY) ||
		isSubtypeOf(k1.type.kind, BaseType.XSDURATION) ||
		isSubtypeOf(k1.type.kind, BaseType.XSQNAME) ||
		isSubtypeOf(k1.type.kind, BaseType.XSNOTATION);
	const k2IsOther =
		isSubtypeOf(k2.type.kind, BaseType.XSBOOLEAN) ||
		isSubtypeOf(k2.type.kind, BaseType.XSHEXBINARY) ||
		isSubtypeOf(k2.type.kind, BaseType.XSDURATION) ||
		isSubtypeOf(k2.type.kind, BaseType.XSQNAME) ||
		isSubtypeOf(k2.type.kind, BaseType.XSNOTATION);
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
