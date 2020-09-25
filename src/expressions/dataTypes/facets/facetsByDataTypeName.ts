import decimalComparator from './comparators/decimalComparator';

// fractionDigits
function validateFractionDigits(value, fractionDigits) {
	const string = value.toString();
	if (string.indexOf('.') > -1 && fractionDigits === 0) {
		return false;
	}

	const regex = /^[-+]?0*([1-9]\d*)?(?:\.((?:\d*[1-9])*)0*)?$/,
		match = regex.exec(string);

	if (!match[2]) {
		return true;
	}

	return match[2].length <= fractionDigits;
}

// maxInclusive, maxExclusive, minInclusive, minExclusive
function createMaxInclusiveFacet(comperator) {
	return function validateMaxInclusive(value, maxInclusive) {
		return comperator(value, maxInclusive) < 1;
	};
}
function createMaxExclusiveFacet(comperator) {
	return function validateMaxExclusive(value, maxExclusive) {
		return comperator(value, maxExclusive) < 0;
	};
}
function createMinInclusiveFacet(comperator) {
	return function validateMinInclusive(value, minInclusive) {
		return comperator(value, minInclusive) > -1;
	};
}
function createMinExclusiveFacet(comperator) {
	return function validateMinExclusive(value, minExclusive) {
		return comperator(value, minExclusive) > 0;
	};
}

function validateExplicitTimeZone(value, option) {
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
	'xs:string': {},
	'xs:boolean': {},
	'xs:float': {},
	'xs:double': {},
	'xs:decimal': {
		fractionDigits: validateFractionDigits,
		maxInclusive: createMaxInclusiveFacet(decimalComparator),
		maxExclusive: createMaxExclusiveFacet(decimalComparator),
		minInclusive: createMinInclusiveFacet(decimalComparator),
		minExclusive: createMinExclusiveFacet(decimalComparator),
	},
	'xs:duration': {},
	'xs:dateTime': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:time': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:date': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:gYearMonth': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:gYear': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:gMonthDay': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:gDay': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:gMonth': {
		explicitTimezone: validateExplicitTimeZone,
	},
	'xs:hexBinary': {},
	'xs:base64Binary': {},
	'xs:anyURI': {},
	'xs:QName': {},
	'xs:NOTATION': {},
	list: {},
	union: {},
};
