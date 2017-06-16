// Validators for all XML-schema built-in types.
// Implemented by spec: http://www.w3.org/TR/xmlschema-2/

/**
 * @param   {string}   _value
 * @return  {boolean}
 */
function isValidAnySimpleType (_value) {
	return true;
}

/**
 * @param   {string}   _value
 * @return  {boolean}
 */
function isValidAnyAtomicType (_value) {
	return true;
}

/**
 * @param   {string}   _value
 * @return  {boolean}
 */
function isValidString (_value) {
	return true;
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidBoolean (value) {
	return /^(0|1|true|false)$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidFloat (value) {
	return isValidDouble(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidDouble (value) {
	return /^([+-]?(\d*(\.\d*)?([eE][+-]?\d*)?|INF)|NaN)$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidDecimal (value) {
	return /^[+-]?\d*(\.\d*)?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidDuration (value) {
	// The lexical space of xsd:duration is the format defined by ISO 8601 under the form:
	// PnYnMnDTnHnMnS
	return /^(-)?P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(\.\d*)?S)?)?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidDateTime (value) {
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidTime (value) {
	return /^(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidDate (value) {
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidGYearMonth (value) {
	// Why optional years? http://www.w3.org/TR/xmlschema-2/#morethan9999years
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidGYear (value) {
	// Why optional years? http://www.w3.org/TR/xmlschema-2/#morethan9999years
	return /^-?([1-9][0-9]{3,}|0[0-9]{3})(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidGMonthDay (value) {
	return /^--(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidGDay (value) {
	return /^---(0[1-9]|[12][0-9]|3[01])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidGMonth (value) {
	return /^--(0[1-9]|1[0-2])(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidHexBinary (value) {
	return /^([0-9A-Fa-f]{2})*$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidBase64Binary (value) {
	const regex = new RegExp(/^((([A-Za-z0-9+/] ?){4})*((([A-Za-z0-9+/] ?){3}[A-Za-z0-9+/])|(([A-Za-z0-9+/] ?){2}[AEIMQUYcgkosw048] ?=)|(([A-Za-z0-9+/] ?)[AQgw] ?= ?=)))?$/);
	return regex.test(value);
}

/**
 * @param   {string}   _value
 * @return  {boolean}
 */
function isValidAnyURI (_value) {
	return true;
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidName (value) {
	return /^[_:A-Za-z][-._:A-Za-z0-9]*$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidNCName (value) {
	return isValidName(value) && /^[_A-Za-z]([-._A-Za-z0-9])*$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidQName (value) {
	const parts = value.split(':');
	if (parts.length === 1) {
		return isValidNCName(parts[0]);
	}
	if (parts.length !== 2) {
		return false;
	}
	return isValidNCName(parts[0]) && isValidNCName(parts[1]);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */// Derived data types from here, should be DEPRECATED once we have (basic) support for patterns
function isValidNormalizedString (value) {
	return !/[\u0009\u000A\u000D]/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidToken (value) {
	// The space of a token is that of a normalizedString,
	// excluding double spaces and leading / trailing spaces
	return isValidNormalizedString(value) &&
		!/^ | {2,}| $/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidLanguage (value) {
	return /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidNMTOKEN (value) {
	return /^[-._:A-Za-z0-9]+$/.test(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidID (value) {
	// IDs are NCNames
	return isValidNCName(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidENTITY (value) {
	// ENTITY is NCName
	return isValidNCName(value);
}

/**
 * @param   {string}   value
 * @return  {boolean}
 */
function isValidInteger (value) {
	return /^[+-]?\d+$/.test(value);
}

export default {
	'xs:anySimpleType': isValidAnySimpleType,
	'xs:anyAtomicType': isValidAnyAtomicType,

	'xs:string': isValidString,
	'xs:boolean': isValidBoolean,
	'xs:float': isValidFloat,
	'xs:double': isValidDouble,
	'xs:decimal': isValidDecimal,
	'xs:duration': isValidDuration,
	'xs:dateTime': isValidDateTime,
	'xs:time': isValidTime,
	'xs:date': isValidDate,
	'xs:gYearMonth': isValidGYearMonth,
	'xs:gYear': isValidGYear,
	'xs:gMonthDay': isValidGMonthDay,
	'xs:gDay': isValidGDay,
	'xs:gMonth': isValidGMonth,
	'xs:hexBinary': isValidHexBinary,
	'xs:base64Binary': isValidBase64Binary,
	'xs:anyURI': isValidAnyURI,
	'xs:NOTATION': isValidQName,

	'xs:normalizedString': isValidNormalizedString,
	'xs:token': isValidToken,
	'xs:language': isValidLanguage,
	'xs:NMTOKEN': isValidNMTOKEN,
	'xs:Name': isValidName,
	'xs:QName': isValidQName,
	'xs:NCName': isValidNCName,
	'xs:ID': isValidID,
	'xs:IDREF': isValidID,
	'xs:ENTITY': isValidENTITY,

	'xs:integer': isValidInteger
};
