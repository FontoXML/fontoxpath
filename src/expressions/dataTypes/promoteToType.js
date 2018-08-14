import createAtomicValue from './createAtomicValue';
import isSubtypeOf from './isSubtypeOf';

export default function promoteToType (value, type) {
	if (isSubtypeOf(value.type, 'xs:numeric')) {
		if (isSubtypeOf(value.type, 'xs:float')) {
			if (type === 'xs:double') {
				return createAtomicValue(value.value, 'xs:double');
			}
			return null;
		}
		if (isSubtypeOf(value.type, 'xs:decimal')) {
			if (type === 'xs:float') {
				return createAtomicValue(value.value, 'xs:float');
			}
			if (type === 'xs:double') {
				return createAtomicValue(value.value, 'xs:double');
			}
		}
		return null;
	}

	if (isSubtypeOf(value.type, 'xs:anyURI')) {
		if (type === 'xs:string') {
			return createAtomicValue(value.value, 'xs:string');
		}
	}
	return null;
}
