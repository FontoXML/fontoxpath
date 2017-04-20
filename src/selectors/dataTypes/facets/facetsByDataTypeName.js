import decimalComparator from './comparators/decimalComparator';
import doubleComparator from './comparators/doubleComparator';
import dateTimeComparator from './comparators/dateTimeComparator';
import durationComparator from './comparators/durationComparator';

// enumeration
function validateEnumeration (value, enumeration) {
	return enumeration.includes(value);
}
function validateEnumerationList (value, enumeration) {
	return value.split(' ').every(function (val) {
		return enumeration.includes(val);
	});
}

// length, minLength, maxLength
function getStringLength (value) {
	// String is measured in code points
	return value.length;
}
function getHexBinaryLength (value) {
	return value.length / 2;
}
function getBase64Length (value) {
	return Math.floor(value.replace(/[\u0009\u000A\u000D\u0020=]/g, '').length * 3 / 4);
}
function getListLength (value) {
	return value.split(' ').length;
}
function createLengthFacet (getLengthFunction) {
	return function validateLength (value, length) {
		return getLengthFunction(value) === length;
	};
}
function createMinLengthFacet (getLengthFunction) {
	return function validateMinLength (value, minLength) {
		return getLengthFunction(value) >= minLength;
	};
}
function createMaxLengthFacet (getLengthFunction) {
	return function validateMaxLength (value, maxLength) {
		return getLengthFunction(value) <= maxLength;
	};
}

// totalDigits
function validateTotalDigits (value, totalDigits) {
	var regex = /^[-+]?0*([1-9]\d*)?(?:\.((?:\d*[1-9])*)0*)?$/,
		match = regex.exec(value),
		total = (match[1] ? match[1].length : 0) + (match[2] ? match[2].length : 0);

	return total <= totalDigits;
}

// fractionDigits
function validateFractionDigits (value, fractionDigits) {
	const string = value.toString();
	if (string.indexOf('.') > -1 && fractionDigits === 0) {
		return false;
	}

	var regex = /^[-+]?0*([1-9]\d*)?(?:\.((?:\d*[1-9])*)0*)?$/,
		match = regex.exec(string);

	if (!match[2]) {
		return true;
	}

	return match[2].length <= fractionDigits;
}

// maxInclusive, maxExclusive, minInclusive, minExclusive
function createMaxInclusiveFacet (comperator) {
	return function validateMaxInclusive (value, maxInclusive) {
		return comperator(value, maxInclusive) < 1;
	};
}
function createMaxExclusiveFacet (comperator) {
	return function validateMaxExclusive (value, maxExclusive) {
		return comperator(value, maxExclusive) < 0;
	};
}
function createMinInclusiveFacet (comperator) {
	return function validateMinInclusive (value, minInclusive) {
		return comperator(value, minInclusive) > -1;
	};
}
function createMinExclusiveFacet (comperator) {
	return function validateMinExclusive (value, minExclusive) {
		return comperator(value, minExclusive) > 0;
	};
}

function validateExplicitTimeZone (value, option) {
	switch (option) {
		case 'required':
			return /(Z)|([+-])([01]\d):([0-5]\d)$/.test(value.toString());
		case 'prohibited':
			return !/(Z)|([+-])([01]\d):([0-5]\d)$/.test(value.toString());
		case 'optional':
			return true;
	}
}

export default {
	'xs:string': {
		length: createLengthFacet(getStringLength),
		minLength: createMinLengthFacet(getStringLength),
		maxLength: createMaxLengthFacet(getStringLength),
		enumeration: validateEnumeration
	},
	'xs:boolean': {},
	'xs:float': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(doubleComparator),
		maxExclusive: createMaxExclusiveFacet(doubleComparator),
		minInclusive: createMinInclusiveFacet(doubleComparator),
		minExclusive: createMinExclusiveFacet(doubleComparator)
	},
	'xs:double': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(doubleComparator),
		maxExclusive: createMaxExclusiveFacet(doubleComparator),
		minInclusive: createMinInclusiveFacet(doubleComparator),
		minExclusive: createMinExclusiveFacet(doubleComparator)
	},
	'xs:decimal': {
		totalDigits: validateTotalDigits,
		fractionDigits: validateFractionDigits,
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(decimalComparator),
		maxExclusive: createMaxExclusiveFacet(decimalComparator),
		minInclusive: createMinInclusiveFacet(decimalComparator),
		minExclusive: createMinExclusiveFacet(decimalComparator)
	},
	'xs:duration': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(durationComparator),
		maxExclusive: createMaxExclusiveFacet(durationComparator),
		minInclusive: createMinInclusiveFacet(durationComparator),
		minExclusive: createMinExclusiveFacet(durationComparator)
	},
	'xs:dateTime': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:time': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:date': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:gYearMonth': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:gYear': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:gMonthDay': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:gDay': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:gMonth': {
		enumeration: validateEnumeration,
		maxInclusive: createMaxInclusiveFacet(dateTimeComparator),
		maxExclusive: createMaxExclusiveFacet(dateTimeComparator),
		minInclusive: createMinInclusiveFacet(dateTimeComparator),
		minExclusive: createMinExclusiveFacet(dateTimeComparator),
		explicitTimezone: validateExplicitTimeZone
	},
	'xs:hexBinary': {
		length: createLengthFacet(getHexBinaryLength),
		minLength: createMinLengthFacet(getHexBinaryLength),
		maxLength: createMaxLengthFacet(getHexBinaryLength),
		enumeration: validateEnumeration
	},
	'xs:base64Binary': {
		length: createLengthFacet(getBase64Length),
		minLength: createMinLengthFacet(getBase64Length),
		maxLength: createMaxLengthFacet(getBase64Length),
		enumeration: validateEnumeration
	},
	'xs:anyURI': {
		length: createLengthFacet(getStringLength),
		minLength: createMinLengthFacet(getStringLength),
		maxLength: createMaxLengthFacet(getStringLength),
		enumeration: validateEnumeration
	},
	'xs:QName': {
		enumeration: validateEnumeration
	},
	'xs:NOTATION': {
		enumeration: validateEnumeration
	},
	list: {
		length: createLengthFacet(getListLength),
		minLength: createMinLengthFacet(getListLength),
		maxLength: createMaxLengthFacet(getListLength),
		enumeration: validateEnumerationList
	},
	union: {
		enumeration: validateEnumeration
	}
};
