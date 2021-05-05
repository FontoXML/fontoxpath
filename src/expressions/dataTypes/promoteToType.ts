import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import { BaseType, ValueType, SequenceType } from './Value';

export default function promoteToType(value, type: BaseType) {
	if (isSubtypeOf(value.type.kind, BaseType.XSNUMERIC)) {
		if (isSubtypeOf(value.type, BaseType.XSFLOAT)) {
			if (type === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
			return null;
		}
		if (isSubtypeOf(value.type, BaseType.XSDECIMAL)) {
			if (type === BaseType.XSFLOAT) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSFLOAT,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
			if (type === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, {
					kind: BaseType.XSDOUBLE,
					seqType: SequenceType.EXACTLY_ONE,
				});
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type, BaseType.XSANYURI)) {
		if (type === BaseType.XSSTRING) {
			return createAtomicValue(value.value, {
				kind: BaseType.XSSTRING,
				seqType: SequenceType.EXACTLY_ONE,
			});
		}
	}
	return null;
}
