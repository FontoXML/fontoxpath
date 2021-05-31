import { ValueType } from '../Value';
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

function getFacetByDataType(type: ValueType) {
	switch (type) {
		case ValueType.XSSTRING:
		case ValueType.XSBOOLEAN:
		case ValueType.XSFLOAT:
		case ValueType.XSDOUBLE:
			return {};
		case ValueType.XSDECIMAL:
			return {
				fractionDigits: validateFractionDigits,
				maxInclusive: createMaxInclusiveFacet(decimalComparator),
				maxExclusive: createMaxExclusiveFacet(decimalComparator),
				minInclusive: createMinInclusiveFacet(decimalComparator),
				minExclusive: createMinExclusiveFacet(decimalComparator),
			};
		case ValueType.XSDURATION:
			return {};
		case ValueType.XSDATETIME:
		case ValueType.XSTIME:
		case ValueType.XSDATE:
		case ValueType.XSGYEARMONTH:
		case ValueType.XSGYEAR:
		case ValueType.XSGMONTHDAY:
		case ValueType.XSGDAY:
		case ValueType.XSGMONTH:
			return { explicitTimezone: validateExplicitTimeZone };
		case ValueType.XSHEXBINARY:
		case ValueType.XSBASE64BINARY:
		case ValueType.XSANYURI:
		case ValueType.XSQNAME:
		case ValueType.XSNOTATION:
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
