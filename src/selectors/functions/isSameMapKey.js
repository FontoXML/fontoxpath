import isInstanceOfType from '../dataTypes/isInstanceOfType';
export default function isSameKey (k1, k2) {
	var k1IsStringLike = isInstanceOfType(k1, 'xs:string') || isInstanceOfType(k1, 'xs:anyURI') || isInstanceOfType(k1, 'xs:untypedAtomic');
	var k2IsStringLike = isInstanceOfType(k2, 'xs:string') || isInstanceOfType(k2, 'xs:anyURI') || isInstanceOfType(k2, 'xs:untypedAtomic');

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	var k1IsNumeric = isInstanceOfType(k1, 'xs:decimal') || isInstanceOfType(k1, 'xs:double') || isInstanceOfType(k1, 'xs:float');
	var k2IsNumeric = isInstanceOfType(k2, 'xs:decimal') || isInstanceOfType(k2, 'xs:double') || isInstanceOfType(k2, 'xs:float');
	if (k1IsNumeric && k2IsNumeric) {
		if (isNaN(k1.value) && isNaN(k2.value)) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	var k1IsOther = isInstanceOfType(k1, 'xs:boolean') || isInstanceOfType(k1, 'xs:hexBinary') || isInstanceOfType(k1, 'xs:duration') || isInstanceOfType(k1, 'xs:QName') || isInstanceOfType(k1, 'xs:NOTATION');
	var k2IsOther = isInstanceOfType(k2, 'xs:boolean') || isInstanceOfType(k2, 'xs:hexBinary') || isInstanceOfType(k2, 'xs:duration') || isInstanceOfType(k2, 'xs:QName') || isInstanceOfType(k2, 'xs:NOTATION');
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
