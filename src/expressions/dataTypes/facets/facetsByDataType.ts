import { BaseType } from '../../dataTypes/BaseType';
import decimalComparator from './comparators/decimalComparator';

// fractionDigits
function validateFractionDigits(value, fractionDigits) {
	const stringValue = value.toString();
	if (stringValue.indexOf('.') > -1 && fractionDigits === 0) {
		return false;
	}

	const regex = /^[-+]?0*([1-9]\d*)?(?:\.((?:\d*[1-9])*)0*)?$/;
	const match = regex.exec(stringValue);

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

function getFacetByDataType(type: BaseType) {
	switch (type) {
		case BaseType.XSSTRING:
		case BaseType.XSBOOLEAN:
		case BaseType.XSFLOAT:
		case BaseType.XSDOUBLE:
			return {};
		case BaseType.XSDECIMAL:
			return {
				fractionDigits: validateFractionDigits,
				maxInclusive: createMaxInclusiveFacet(decimalComparator),
				maxExclusive: createMaxExclusiveFacet(decimalComparator),
				minInclusive: createMinInclusiveFacet(decimalComparator),
				minExclusive: createMinExclusiveFacet(decimalComparator),
			};
		case BaseType.XSDURATION:
			return {};
		case BaseType.XSDATETIME:
		case BaseType.XSTIME:
		case BaseType.XSDATE:
		case BaseType.XSGYEARMONTH:
		case BaseType.XSGYEAR:
		case BaseType.XSGMONTHDAY:
		case BaseType.XSGDAY:
		case BaseType.XSGMONTH:
			return { explicitTimezone: validateExplicitTimeZone };
		case BaseType.XSHEXBINARY:
		case BaseType.XSBASE64BINARY:
		case BaseType.XSANYURI:
		case BaseType.XSQNAME:
		case BaseType.XSNOTATION:
			return {};
		default:
			return null;
	}
}

export default {
	getFacetByDataType,
	list: {},
	union: {},
};
