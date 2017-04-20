import createAtomicValue from './createAtomicValue';
import isInstanceOfType from './isInstanceOfType';

export default function promoteToType (value, type) {
	if (isInstanceOfType(value, 'xs:numeric')) {
		if (isInstanceOfType(value, 'xs:float')) {
			if (type === 'xs:double') {
				return createAtomicValue(value.value, 'xs:double');
			}
			return null;
		}
		if (isInstanceOfType(value, 'xs:decimal')) {
			if (type === 'xs:float') {
				return createAtomicValue(value.value, 'xs:float');
			}
			if (type === 'xs:double') {
				return createAtomicValue(value.value, 'xs:double');
			}
		}
		return null;
	}

	if (isInstanceOfType(value, 'xs:anyURI')) {
		if (type === 'xs:string') {
			return createAtomicValue(value.value, 'xs:string');
		}
	}
	return null;
}
