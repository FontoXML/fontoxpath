import isSubtypeOf from '../dataTypes/isSubtypeOf';
export default function isSameKey (k1, k2) {
	var k1IsStringLike = isSubtypeOf(k1.type, 'xs:string') || isSubtypeOf(k1.type, 'xs:anyURI') || isSubtypeOf(k1.type, 'xs:untypedAtomic');
	var k2IsStringLike = isSubtypeOf(k2.type, 'xs:string') || isSubtypeOf(k2.type, 'xs:anyURI') || isSubtypeOf(k2.type, 'xs:untypedAtomic');

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	var k1IsNumeric = isSubtypeOf(k1.type, 'xs:decimal') || isSubtypeOf(k1.type, 'xs:double') || isSubtypeOf(k1.type, 'xs:float');
	var k2IsNumeric = isSubtypeOf(k2.type, 'xs:decimal') || isSubtypeOf(k2.type, 'xs:double') || isSubtypeOf(k2.type, 'xs:float');
	if (k1IsNumeric && k2IsNumeric) {
		if (isNaN(k1.value) && isNaN(k2.value)) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	var k1IsOther = isSubtypeOf(k1.type, 'xs:boolean') || isSubtypeOf(k1.type, 'xs:hexBinary') || isSubtypeOf(k1.type, 'xs:duration') || isSubtypeOf(k1.type, 'xs:QName') || isSubtypeOf(k1.type, 'xs:NOTATION');
	var k2IsOther = isSubtypeOf(k2.type, 'xs:boolean') || isSubtypeOf(k2.type, 'xs:hexBinary') || isSubtypeOf(k2.type, 'xs:duration') || isSubtypeOf(k2.type, 'xs:QName') || isSubtypeOf(k2.type, 'xs:NOTATION');
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
