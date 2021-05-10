// The actual type is type ValueValue = NodePointer | Function | string | number | boolean | QName | Duration | DateTime; but doing that gives us thousands of errors.
type ValueValue = any;

export default class Value {
	constructor(public type: ValueType, readonly value: ValueValue) {}
}

/**
 * The ValueTypes;
 * Previously represented by strings.
 * @public
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
}

/**
 * Handles the occurances in the XPath specs.
 * Zero or one matches to '?';
 * One or more matches to '+';
 * Zero or more matches to '*'
 * @public
 */
export const enum SequenceMultiplicity {
	ZERO_OR_ONE = 0,
	ONE_OR_MORE = 1,
	ZERO_OR_MORE = 2,
	EXACTLY_ONE = 3,
}

/**
 * A seperate enum for the ellipsis function parameter
 * @public
 */
export const enum EllipsisType {
	ELLIPSIS = 4,
}

/**
 * The combined parameter type which is either a value type or an ellipsis type.
 * @public
 */
export type ParameterType = SequenceType | EllipsisType;

/**
 * The type of a sequence, it contains the ValueType and the multiplicity of the sequence.
 * @public
 */
export type SequenceType = {
	mult: SequenceMultiplicity;
	type: ValueType;
};

/**
 * A function to retrieve wether a type starts with xs.
 * @param inType input type.
 * @returns a boolean, true when the type starts with XS
 */
export function startWithXS(inType: ValueType): boolean {
	return startWithXSLookupTable[inType];
}

const startWithXSLookupTable = new Map([
	[ValueType.XSBOOLEAN, true],
	[ValueType.XSSTRING, true],
	[ValueType.XSNUMERIC, true],
	[ValueType.XSDOUBLE, true],
	[ValueType.XSDECIMAL, true],
	[ValueType.XSINTEGER, true],
	[ValueType.XSFLOAT, true],
	[ValueType.XSDATE, true],
	[ValueType.XSTIME, true],
	[ValueType.XSDATETIME, true],
	[ValueType.XSDATETIMESTAMP, true],
	[ValueType.XSGYEARMONTH, true],
	[ValueType.XSGYEAR, true],
	[ValueType.XSGMONTHDAY, true],
	[ValueType.XSGMONTH, true],
	[ValueType.XSGDAY, true],
	[ValueType.XSYEARMONTHDURATION, true],
	[ValueType.XSDAYTIMEDURATION, true],
	[ValueType.XSDURATION, true],
	[ValueType.XSUNTYPEDATOMIC, true],
	[ValueType.XSANYURI, true],
	[ValueType.XSBASE64BINARY, true],
	[ValueType.XSHEXBINARY, true],
	[ValueType.XSQNAME, true],
	[ValueType.XSNCNAME, true],
	[ValueType.XSNAME, true],
	[ValueType.XSENTITY, true],
	[ValueType.XSNONPOSITIVEINTEGER, true],
	[ValueType.XSNEGATIVEINTEGER, true],
	[ValueType.XSPOSITIVEINTEGER, true],
	[ValueType.XSNONNEGATIVEINTEGER, true],
	[ValueType.XSLONG, true],
	[ValueType.XSINT, true],
	[ValueType.XSSHORT, true],
	[ValueType.XSBYTE, true],
	[ValueType.XSUNSIGNEDINT, true],
	[ValueType.XSUNSIGNEDLONG, true],
	[ValueType.XSUNSIGNEDBYTE, true],
	[ValueType.XSUNSIGNEDSHORT, true],
	[ValueType.XSERROR, true],
	[ValueType.XSENTITIES, true],
	[ValueType.XSIDREF, true],
	[ValueType.XSID, true],
	[ValueType.XSIDREFS, true],
	[ValueType.XSNOTATION, true],
	[ValueType.XSANYSIMPLETYPE, true],
	[ValueType.XSANYATOMICTYPE, true],
	[ValueType.ATTRIBUTE, false],
	[ValueType.XSNORMALIZEDSTRING, true],
	[ValueType.XSNMTOKENS, true],
	[ValueType.XSNMTOKEN, true],
	[ValueType.XSLANGUAGE, true],
	[ValueType.XSTOKEN, true],
	[ValueType.NODE, false],
	[ValueType.ELEMENT, false],
	[ValueType.DOCUMENTNODE, false],
	[ValueType.TEXT, false],
	[ValueType.PROCESSINGINSTRUCTION, false],
	[ValueType.COMMENT, false],
	[ValueType.ITEM, false],
	[ValueType.FUNCTION, false],
	[ValueType.MAP, false],
	[ValueType.ARRAY, false],
]);

/**
 * Creates a string value from a base type, generally follows the 'xs:type' notation, where
 * xs stands for XML Schema
 * @param input The base type to get the string of
 * @returns A string corresponding to that base type.
 */
export function valueTypeToString(input: ValueType): string {
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
	};

	const stringVal = typeToStringMap[input];
	if (stringVal === undefined || stringVal === null) {
		throw new Error(`Cannot convert ValueType of type "${input}" to a string`);
	}
	return stringVal;
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
		throw new Error('XPST0081: Invalid prefix for input ' + input);
	}

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

	const type = stringToValueTypeMap[input];

	if (type === undefined || type === null) {
		throw new Error(`XPST0051: Cannot convert String of type "${input}" to ValueType`);
	}

	return type;
}

export function stringtoSequenceType(input: string): SequenceType {
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
