export default function isSameKey (k1, k2) {
	var k1IsStringLike = k1.instanceOfType('xs:string') || k1.instanceOfType('xs:anyURI') || k1.instanceOfType('xs:untypedAtomic');
	var k2IsStringLike = k2.instanceOfType('xs:string') || k2.instanceOfType('xs:anyURI') || k2.instanceOfType('xs:untypedAtomic');

	if (k1IsStringLike && k2IsStringLike) {
		// fn:codepoint-equal is ===
		return k1.value === k2.value;
	}

	var k1IsNumeric = k1.instanceOfType('xs:decimal') || k1.instanceOfType('xs:double') || k1.instanceOfType('xs:float');
	var k2IsNumeric = k2.instanceOfType('xs:decimal') || k2.instanceOfType('xs:double') || k2.instanceOfType('xs:float');
	if (k1IsNumeric && k2IsNumeric) {
		if (k1.isNaN() && k2.isNaN()) {
			return true;
		}
		return k1.value === k2.value;
	}
	// TODO: dateTime

	var k1IsOther = k1.instanceOfType('xs:boolean') || k1.instanceOfType('xs:hexBinary') || k1.instanceOfType('xs:duration') || k1.instanceOfType('xs:QName') || k1.instanceOfType('xs:NOTATION');
	var k2IsOther = k2.instanceOfType('xs:boolean') || k2.instanceOfType('xs:hexBinary') || k2.instanceOfType('xs:duration') || k2.instanceOfType('xs:QName') || k2.instanceOfType('xs:NOTATION');
	if (k1IsOther && k2IsOther) {
		return k1.value === k2.value;
	}

	return false;
}
