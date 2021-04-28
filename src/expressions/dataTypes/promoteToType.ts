import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';
import { BaseType } from './Value';

export default function promoteToType(value, type) {
	if (isSubtypeOf(value.type, { kind: BaseType.XSNUMERIC })) {
		if (isSubtypeOf(value.type, { kind: BaseType.XSFLOAT })) {
			if (type === 'xs:double') {
				return createAtomicValue(value.value, { kind: BaseType.XSDOUBLE });
			}
			return null;
		}
		if (isSubtypeOf(value.type, { kind: BaseType.XSDECIMAL })) {
			if (type === 'xs:float') {
				return createAtomicValue(value.value, { kind: BaseType.XSFLOAT });
			}
			if (type === 'xs:double') {
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
