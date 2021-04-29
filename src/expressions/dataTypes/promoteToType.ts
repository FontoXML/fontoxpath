import { ValueType } from 'src';
import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import { BaseType } from './Value';

export default function promoteToType(value, type: ValueType) {
	if (isSubtypeOf(value.type, { kind: BaseType.XSNUMERIC })) {
		if (isSubtypeOf(value.type, { kind: BaseType.XSFLOAT })) {
			if (type.kind === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, { kind: BaseType.XSDOUBLE });
			}
			return null;
		}
		if (isSubtypeOf(value.type, { kind: BaseType.XSDECIMAL })) {
			if (type.kind === BaseType.XSFLOAT) {
				return createAtomicValue(value.value, { kind: BaseType.XSFLOAT });
			}
			if (type.kind === BaseType.XSDOUBLE) {
				return createAtomicValue(value.value, { kind: BaseType.XSDOUBLE });
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type, { kind: BaseType.XSANYURI })) {
		if (type.kind === BaseType.XSSTRING) {
			return createAtomicValue(value.value, { kind: BaseType.XSSTRING });
		}
	}
	return null;
}
