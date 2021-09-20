// The actual type is type ValueValue = NodePointer | Function | string | number | boolean | QName | Duration | DateTime; but doing that gives us thousands of errors.
export type ValueValue = any;

export default class Value {
	constructor(public type: ValueType, readonly value: ValueValue) {}
}

/**
 * The value types. Every value in XPath is of one of these types
 * @private
 */
export const enum ValueType {
	XSBOOLEAN,
	XSSTRING,
	XSNUMERIC,
	XSDOUBLE,
	XSDECIMAL,
	XSINTEGER,
	XSFLOAT,
	XSDATE,
	XSTIME,
	XSDATETIME,
	XSDATETIMESTAMP,
	XSGYEARMONTH,
	XSGYEAR,
	XSGMONTHDAY,
	XSGMONTH,
	XSGDAY,
	XSYEARMONTHDURATION,
	XSDAYTIMEDURATION,
	XSDURATION,
	XSUNTYPEDATOMIC,
	XSANYURI,
	XSBASE64BINARY,
	XSHEXBINARY,
	XSQNAME,
	XSNCNAME,
	XSNAME,
	XSENTITY,
	XSNONPOSITIVEINTEGER,
	XSNEGATIVEINTEGER,
	XSPOSITIVEINTEGER,
	XSNONNEGATIVEINTEGER,
	XSLONG,
	XSINT,
	XSSHORT,
	XSBYTE,
	XSUNSIGNEDINT,
	XSUNSIGNEDLONG,
	XSUNSIGNEDBYTE,
	XSUNSIGNEDSHORT,
	XSERROR,
	XSENTITIES,
	XSIDREF,
	XSID,
	XSIDREFS,
	XSNOTATION,
	XSANYSIMPLETYPE,
	XSANYATOMICTYPE,
	ATTRIBUTE,
	XSNORMALIZEDSTRING,
	XSNMTOKENS,
	XSNMTOKEN,
	XSLANGUAGE,
	XSTOKEN,
	NODE,
	ELEMENT,
	DOCUMENTNODE,
	TEXT,
	PROCESSINGINSTRUCTION,
	COMMENT,
	ITEM,
	FUNCTION,
	MAP,
	ARRAY,
	NONE,
}

/**
 * Handles the occurances in the XPath specs.
 * Zero or one matches to '?';
 * One or more matches to '+';
 * Zero or more matches to '*'
 * @private
 */
export const enum SequenceMultiplicity {
	ZERO_OR_ONE = 0,
	ONE_OR_MORE = 1,
	ZERO_OR_MORE = 2,
	EXACTLY_ONE = 3,
}

/**
 * A seperate enum for the ellipsis function parameter
 * @private
 */
export const enum EllipsisType {
	ELLIPSIS = 4,
}

/**
 * The combined parameter type which is either a value type or an ellipsis type.
 * @private
 */
export type ParameterType = SequenceType | EllipsisType;

/**
 * The type of a sequence, it contains the ValueType and the multiplicity of the sequence.
 * @private
 */
export type SequenceType = {
	mult: SequenceMultiplicity;
	type: ValueType;
};

const typeToStringMap: Record<ValueType, string> = {
	[ValueType.XSBOOLEAN]: 'xs:boolean',
	[ValueType.XSSTRING]: 'xs:string',
	[ValueType.XSNUMERIC]: 'xs:numeric',
	[ValueType.XSDOUBLE]: 'xs:double',
	[ValueType.XSDECIMAL]: 'xs:decimal',
	[ValueType.XSINTEGER]: 'xs:integer',
	[ValueType.XSFLOAT]: 'xs:float',
	[ValueType.XSDATE]: 'xs:date',
	[ValueType.XSTIME]: 'xs:time',
	[ValueType.XSDATETIME]: 'xs:dateTime',
	[ValueType.XSDATETIMESTAMP]: 'xs:dateTimeStamp',
	[ValueType.XSGYEARMONTH]: 'xs:gYearMonth',
	[ValueType.XSGYEAR]: 'xs:gYear',
	[ValueType.XSGMONTHDAY]: 'xs:gMonthDay',
	[ValueType.XSGMONTH]: 'xs:gMonth',
	[ValueType.XSGDAY]: 'xs:gDay',
	[ValueType.XSYEARMONTHDURATION]: 'xs:yearMonthDuration',
	[ValueType.XSDAYTIMEDURATION]: 'xs:dayTimeDuration',
	[ValueType.XSDURATION]: 'xs:duration',
	[ValueType.XSUNTYPEDATOMIC]: 'xs:untypedAtomic',
	[ValueType.XSANYURI]: 'xs:anyURI',
	[ValueType.XSBASE64BINARY]: 'xs:base64Binary',
	[ValueType.XSHEXBINARY]: 'xs:hexBinary',
	[ValueType.XSQNAME]: 'xs:QName',
	[ValueType.XSNCNAME]: 'xs:NCName',
	[ValueType.XSNAME]: 'xs:Name',
	[ValueType.XSENTITY]: 'xs:ENTITY',
	[ValueType.XSNONPOSITIVEINTEGER]: 'xs:nonPositiveInteger',
	[ValueType.XSNEGATIVEINTEGER]: 'xs:negativeInteger',
	[ValueType.XSPOSITIVEINTEGER]: 'xs:positiveInteger',
	[ValueType.XSNONNEGATIVEINTEGER]: 'xs:nonNegativeInteger',
	[ValueType.XSLONG]: 'xs:long',
	[ValueType.XSINT]: 'xs:int',
	[ValueType.XSSHORT]: 'xs:short',
	[ValueType.XSBYTE]: 'xs:byte',
	[ValueType.XSUNSIGNEDINT]: 'xs:unsignedInt',
	[ValueType.XSUNSIGNEDLONG]: 'xs:unsignedLong',
	[ValueType.XSUNSIGNEDBYTE]: 'xs:unsignedByte',
	[ValueType.XSUNSIGNEDSHORT]: 'xs:unsignedShort',
	[ValueType.XSERROR]: 'xs:error',
	[ValueType.XSENTITIES]: 'xs:ENTITIES',
	[ValueType.XSIDREF]: 'xs:IDREF',
	[ValueType.XSID]: 'xs:ID',
	[ValueType.XSIDREFS]: 'xs:IDFREFS',
	[ValueType.XSNOTATION]: 'xs:NOTATION',
	[ValueType.XSANYSIMPLETYPE]: 'xs:anySimpleType',
	[ValueType.XSANYATOMICTYPE]: 'xs:anyAtomicType',
	[ValueType.ATTRIBUTE]: 'attribute()',
	[ValueType.XSNORMALIZEDSTRING]: 'xs:normalizedString',
	[ValueType.XSNMTOKENS]: 'xs:NMTOKENS',
	[ValueType.XSNMTOKEN]: 'xs:NMTOKEN',
	[ValueType.XSLANGUAGE]: 'xs:language',
	[ValueType.XSTOKEN]: 'xs:token',
	[ValueType.NODE]: 'node()',
	[ValueType.ELEMENT]: 'element()',
	[ValueType.DOCUMENTNODE]: 'document-node()',
	[ValueType.TEXT]: 'text()',
	[ValueType.PROCESSINGINSTRUCTION]: 'processing-instruction()',
	[ValueType.COMMENT]: 'comment()',
	[ValueType.ITEM]: 'item()',
	[ValueType.FUNCTION]: 'function(*)',
	[ValueType.MAP]: 'map(*)',
	[ValueType.ARRAY]: 'array(*)',
	[ValueType.NONE]: 'none',
};

const stringToValueTypeMap: { [key: string]: ValueType } = {
	'xs:boolean': ValueType.XSBOOLEAN,
	'xs:string': ValueType.XSSTRING,
	'xs:numeric': ValueType.XSNUMERIC,
	'xs:double': ValueType.XSDOUBLE,
	'xs:decimal': ValueType.XSDECIMAL,
	'xs:integer': ValueType.XSINTEGER,
	'xs:float': ValueType.XSFLOAT,
	'xs:date': ValueType.XSDATE,
	'xs:time': ValueType.XSTIME,
	'xs:dateTime': ValueType.XSDATETIME,
	'xs:dateTimeStamp': ValueType.XSDATETIMESTAMP,
	'xs:gYearMonth': ValueType.XSGYEARMONTH,
	'xs:gYear': ValueType.XSGYEAR,
	'xs:gMonthDay': ValueType.XSGMONTHDAY,
	'xs:gMonth': ValueType.XSGMONTH,
	'xs:gDay': ValueType.XSGDAY,
	'xs:yearMonthDuration': ValueType.XSYEARMONTHDURATION,
	'xs:dayTimeDuration': ValueType.XSDAYTIMEDURATION,
	'xs:duration': ValueType.XSDURATION,
	'xs:untypedAtomic': ValueType.XSUNTYPEDATOMIC,
	'xs:anyURI': ValueType.XSANYURI,
	'xs:base64Binary': ValueType.XSBASE64BINARY,
	'xs:hexBinary': ValueType.XSHEXBINARY,
	'xs:QName': ValueType.XSQNAME,
	'xs:NCName': ValueType.XSNCNAME,
	'xs:Name': ValueType.XSNAME,
	'xs:ENTITY': ValueType.XSENTITY,
	'xs:nonPositiveInteger': ValueType.XSNONPOSITIVEINTEGER,
	'xs:negativeInteger': ValueType.XSNEGATIVEINTEGER,
	'xs:positiveInteger': ValueType.XSPOSITIVEINTEGER,
	'xs:nonNegativeInteger': ValueType.XSNONNEGATIVEINTEGER,
	'xs:long': ValueType.XSLONG,
	'xs:int': ValueType.XSINT,
	'xs:short': ValueType.XSSHORT,
	'xs:byte': ValueType.XSBYTE,
	'xs:unsignedInt': ValueType.XSUNSIGNEDINT,
	'xs:unsignedLong': ValueType.XSUNSIGNEDLONG,
	'xs:unsignedByte': ValueType.XSUNSIGNEDBYTE,
	'xs:unsignedShort': ValueType.XSUNSIGNEDSHORT,
	'xs:error': ValueType.XSERROR,
	'xs:ENTITIES': ValueType.XSENTITIES,
	'xs:IDREF': ValueType.XSIDREF,
	'xs:ID': ValueType.XSID,
	'xs:IDREFS': ValueType.XSIDREFS,
	'xs:NOTATION': ValueType.XSNOTATION,
	'xs:anySimpleType': ValueType.XSANYSIMPLETYPE,
	'xs:anyAtomicType': ValueType.XSANYATOMICTYPE,
	'attribute()': ValueType.ATTRIBUTE,
	'xs:normalizedString': ValueType.XSNORMALIZEDSTRING,
	'xs:NMTOKENS': ValueType.XSNMTOKENS,
	'xs:NMTOKEN': ValueType.XSNMTOKEN,
	'xs:language': ValueType.XSLANGUAGE,
	'xs:token': ValueType.XSTOKEN,
	'node()': ValueType.NODE,
	'element()': ValueType.ELEMENT,
	'document-node()': ValueType.DOCUMENTNODE,
	'text()': ValueType.TEXT,
	'processing-instruction()': ValueType.PROCESSINGINSTRUCTION,
	'comment()': ValueType.COMMENT,
	'item()': ValueType.ITEM,
	'function(*)': ValueType.FUNCTION,
	'map(*)': ValueType.MAP,
	'array(*)': ValueType.ARRAY,
};

/**
 * Creates a string value from a base type, generally follows the 'xs:type' notation, where
 * xs stands for XML Schema
 * @param input The base type to get the string of
 * @returns A string corresponding to that base type.
 */
export function valueTypeToString(input: ValueType): string {
	return typeToStringMap[input];
}

/**
 * Converts a ValueType to the correct string representation
 *
 * @param input the ValueType
 * @returns the correct string representation of the type
 */
export function sequenceTypeToString(input: SequenceType): string {
	if (input.mult === SequenceMultiplicity.ZERO_OR_MORE) {
		return valueTypeToString(input.type) + '*';
	}
	if (input.mult === SequenceMultiplicity.ONE_OR_MORE) {
		return valueTypeToString(input.type) + '+';
	}
	if (input.mult === SequenceMultiplicity.ZERO_OR_ONE) {
		return valueTypeToString(input.type) + '?';
	}

	return valueTypeToString(input.type);
}

export function stringToValueType(input: string): ValueType {
	if (!input.startsWith('xs:') && input.indexOf(':') >= 0) {
		throw new Error(`XPST0081: Invalid prefix for input ${input}`);
	}

	const type = stringToValueTypeMap[input];

	if (type === undefined) {
		throw new Error(`XPST0051: The type "${input}" could not be found`);
	}

	return type;
}

export function stringToSequenceType(input: string): SequenceType {
	switch (input[input.length - 1]) {
		case '*':
			return {
				type: stringToValueType(input.substr(0, input.length - 1)),
				mult: SequenceMultiplicity.ZERO_OR_MORE,
			};
		case '?':
			return {
				type: stringToValueType(input.substr(0, input.length - 1)),
				mult: SequenceMultiplicity.ZERO_OR_ONE,
			};
		case '+':
			return {
				type: stringToValueType(input.substr(0, input.length - 1)),
				mult: SequenceMultiplicity.ONE_OR_MORE,
			};
		default:
			return {
				type: stringToValueType(input),
				mult: SequenceMultiplicity.EXACTLY_ONE,
			};
	}
}

export function stringToSequenceMultiplicity(input: string): SequenceMultiplicity {
	switch (input) {
		case '*':
			return SequenceMultiplicity.ZERO_OR_MORE;
		case '?':
			return SequenceMultiplicity.ZERO_OR_ONE;
		case '+':
			return SequenceMultiplicity.ONE_OR_MORE;
		default:
			return SequenceMultiplicity.EXACTLY_ONE;
	}
}
