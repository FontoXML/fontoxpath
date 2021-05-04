import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';

export default function isSameMapKey(k1: Value, k2: Value): boolean {
	const k1IsStringLike =
		isSubtypeOf(k1.type, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE });
	const k2IsStringLike =
		isSubtypeOf(k2.type, { kind: BaseType.XSSTRING, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.EXACTLY_ONE });

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	const k1IsNumeric =
		isSubtypeOf(k1.type, { kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE });
	const k2IsNumeric =
		isSubtypeOf(k2.type, { kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSDOUBLE, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE });
	if (k1IsNumeric && k2IsNumeric) {
		if (isNaN(k1.value) && isNaN(k2.value)) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	const k1IsOther =
		isSubtypeOf(k1.type, { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k1.type, { kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE });
	const k2IsOther =
		isSubtypeOf(k2.type, { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSHEXBINARY, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSDURATION, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE }) ||
		isSubtypeOf(k2.type, { kind: BaseType.XSNOTATION, seqType: SequenceType.EXACTLY_ONE });
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
