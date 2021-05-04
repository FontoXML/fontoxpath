import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import { BaseType, ValueType, SequenceType } from './Value';

export default function promoteToType(value, type: ValueType) {
	if (isSubtypeOf(value.type, { kind: BaseType.XSNUMERIC, seqType: SequenceType.EXACTLY_ONE })) {
		if (
			isSubtypeOf(value.type, { kind: BaseType.XSFLOAT, seqType: SequenceType.EXACTLY_ONE })
		) {
			if (type.kind === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
			return null;
		}
		if (
			isSubtypeOf(value.type, { kind: BaseType.XSDECIMAL, seqType: SequenceType.EXACTLY_ONE })
		) {
			if (type.kind === BaseType.XSFLOAT) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
			if (type.kind === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type, { kind: BaseType.XSANYURI, seqType: SequenceType.EXACTLY_ONE })) {
		if (type.kind === BaseType.XSSTRING) {
			return createAtomicValue(value.value, {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			});
		}
	}
	return null;
}
