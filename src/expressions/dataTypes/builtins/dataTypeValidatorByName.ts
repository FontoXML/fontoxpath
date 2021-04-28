// Validators for all XML-schema built-in types.
// Implemented by spec: http://www.w3.org/TR/xmlschema-2/

import { BaseType, ValueType } from '../Value';

function isValidAnySimpleType(_value: string): boolean {
	return true;
}

function isValidAnyAtomicType(_value: string): boolean {
	return true;
}

function isValidString(_value: string): boolean {
	return true;
}

function isValidBoolean(value: string): boolean {
	return /^(0|1|true|false)$/.test(value);
}

function isValidFloat(value: string): boolean {
	return isValidDouble(value);
}

function isValidDouble(value: string): boolean {
	return /^([+-]?(\d*(\.\d*)?([eE][+-]?\d*)?|INF)|NaN)$/.test(value);
}

function isValidDecimal(value: string): boolean {
	return /^[+-]?\d*(\.\d*)?$/.test(value);
}

function isValidDuration(value: string): boolean {
	// The lexical space of xsd:duration is the format defined by ISO 8601 under the form:
	// PnYnMnDTnHnMnS
	return /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/.test(value);
}

function isValidDateTime(value: string): boolean {
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidTime(value: string): boolean {
	return /^(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidDate(value: string): boolean {
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidGYearMonth(value: string): boolean {
	// Why optional years? http://www.w3.org/TR/xmlschema-2/#morethan9999years
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidGYear(value: string): boolean {
	// Why optional years? http://www.w3.org/TR/xmlschema-2/#morethan9999years
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidGMonthDay(value: string): boolean {
	return /^--(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(
		value
	);
}

function isValidGDay(value: string): boolean {
	return /^---(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

function isValidGMonth(value: string): boolean {
	return /^--(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

function isValidHexBinary(value: string): boolean {
	return /^([0-9A-Fa-f]{2})*$/.test(value);
}

function isValidBase64Binary(value: string): boolean {
	const regex = new RegExp(
		/^((([A-Za-z0-9+/] ?){4})*((([A-Za-z0-9+/] ?){3}[A-Za-z0-9+/])|(([A-Za-z0-9+/] ?){2}[AEIMQUYcgkosw048] ?=)|(([A-Za-z0-9+/] ?)[AQgw] ?= ?=)))?$/
	);
	return regex.test(value);
}

function isValidAnyURI(_value: string): boolean {
	return true;
}

function isValidName(value: string): boolean {
	return /^[_:A-Za-z][-._:A-Za-z0-9]*$/.test(value);
}

function isValidNCName(value: string): boolean {
	return isValidName(value) && /^[_A-Za-z]([-._A-Za-z0-9])*$/.test(value);
}

function isValidQName(value: string): boolean {
	const parts = value.split(':');
	if (parts.length === 1) {
		return isValidNCName(parts[0]);
	}
	if (parts.length !== 2) {
		return false;
	}
	return isValidNCName(parts[0]) && isValidNCName(parts[1]);
}

// Derived data types from here, should be DEPRECATED once we have (basic) support for patterns
function isValidNormalizedString(value: string): boolean {
	return !/[\u0009\u000A\u000D]/.test(value);
}

function isValidToken(value: string): boolean {
	// The space of a token is that of a normalizedString,
	// excluding double spaces and leading / trailing spaces
	return isValidNormalizedString(value) && !/^ | {2,}| $/.test(value);
}

function isValidLanguage(value: string): boolean {
	return /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/.test(value);
}

function isValidNMTOKEN(value: string): boolean {
	return /^[-._:A-Za-z0-9]+$/.test(value);
}

function isValidID(value: string): boolean {
	// IDs are NCNames
	return isValidNCName(value);
}

function isValidENTITY(value: string): boolean {
	// ENTITY is NCName
	return isValidNCName(value);
}

function isValidInteger(value: string): boolean {
	return /^[+-]?\d+$/.test(value);
}

function isValidYearMonthDuration(value: string): boolean {
	return /^-?P[0-9]+(Y([0-9]+M)?|M)$/.test(value);
}

function isValidDayTimeDuration(value: string): boolean {
	return /^-?P([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+(\.[0-9]+)?S)?)?$/.test(value);
}

export function getValidatorForType(type: BaseType): (value: string) => boolean {
	switch (type) {
		case BaseType.XSANYSIMPLETYPE:
			return isValidAnySimpleType;
		case BaseType.XSANYATOMICTYPE:
			return isValidAnyAtomicType;
		case BaseType.XSSTRING:
			return isValidString;
		case BaseType.XSBOOLEAN:
			return isValidBoolean;
		case BaseType.XSFLOAT:
			return isValidFloat;
		case BaseType.XSDOUBLE:
			return isValidDouble;
		case BaseType.XSDECIMAL:
			return isValidDecimal;
		case BaseType.XSDURATION:
			return isValidDuration;
		case BaseType.XSDATETIME:
			return isValidDateTime;
		case BaseType.XSTIME:
			return isValidTime;
		case BaseType.XSDATE:
			return isValidDate;
		case BaseType.XSYEARMONTHDURATION:
			return isValidGYearMonth;
		case BaseType.XSGMONTHDAY:
			return isValidGMonthDay;
		case BaseType.XSGDAY:
			return isValidGDay;
		case BaseType.XSGMONTH:
			return isValidGMonth;
		case BaseType.XSHEXBINARY:
			return isValidHexBinary;
		case BaseType.XSBASE64BINARY:
			return isValidBase64Binary;
		case BaseType.XSANYURI:
			return isValidAnyURI;
		case BaseType.XSQNAME:
			return isValidQName;
		case BaseType.XSNORMALIZEDSTRING:
			return isValidNormalizedString;
		case BaseType.XSTOKEN:
			return isValidToken;
		case BaseType.XSLANGUAGE:
			return isValidLanguage;
		case BaseType.XSNMTOKEN:
			return isValidNMTOKEN;
		case BaseType.XSNAME:
			return isValidName;
		case BaseType.XSQNAME:
			return isValidQName;
		case BaseType.XSNCNAME:
			return isValidNCName;
		case BaseType.XSID:
			return isValidID;
		case BaseType.XSIDREF:
			return isValidID;
		case BaseType.XSENTITY:
			return isValidENTITY;
		case BaseType.XSINTEGER:
			return isValidInteger;
		case BaseType.XSYEARMONTHDURATION:
			return isValidYearMonthDuration;
		case BaseType.XSDAYTIMEDURATION:
			return isValidDayTimeDuration;
	}
}
