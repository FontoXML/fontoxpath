/**
 * The BaseTypes;
 * Previously represented by strings.
 * @public
 */

export const enum BaseType {
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
 * A function to retrieve wether a type starts with xs.
 * @param inType input type.
 * @returns a boolean, true when the type starts with XS
 */
export function startWithXS(inType: BaseType): boolean {
	return startWithXSLookupTable[inType];
}

const startWithXSLookupTable = new Map([
	[BaseType.XSBOOLEAN, true],
	[BaseType.XSSTRING, true],
	[BaseType.XSNUMERIC, true],
	[BaseType.XSDOUBLE, true],
	[BaseType.XSDECIMAL, true],
	[BaseType.XSINTEGER, true],
	[BaseType.XSFLOAT, true],
	[BaseType.XSDATE, true],
	[BaseType.XSTIME, true],
	[BaseType.XSDATETIME, true],
	[BaseType.XSDATETIMESTAMP, true],
	[BaseType.XSGYEARMONTH, true],
	[BaseType.XSGYEAR, true],
	[BaseType.XSGMONTHDAY, true],
	[BaseType.XSGMONTH, true],
	[BaseType.XSGDAY, true],
	[BaseType.XSYEARMONTHDURATION, true],
	[BaseType.XSDAYTIMEDURATION, true],
	[BaseType.XSDURATION, true],
	[BaseType.XSUNTYPEDATOMIC, true],
	[BaseType.XSANYURI, true],
	[BaseType.XSBASE64BINARY, true],
	[BaseType.XSHEXBINARY, true],
	[BaseType.XSQNAME, true],
	[BaseType.XSNCNAME, true],
	[BaseType.XSNAME, true],
	[BaseType.XSENTITY, true],
	[BaseType.XSNONPOSITIVEINTEGER, true],
	[BaseType.XSNEGATIVEINTEGER, true],
	[BaseType.XSPOSITIVEINTEGER, true],
	[BaseType.XSNONNEGATIVEINTEGER, true],
	[BaseType.XSLONG, true],
	[BaseType.XSINT, true],
	[BaseType.XSSHORT, true],
	[BaseType.XSBYTE, true],
	[BaseType.XSUNSIGNEDINT, true],
	[BaseType.XSUNSIGNEDLONG, true],
	[BaseType.XSUNSIGNEDBYTE, true],
	[BaseType.XSUNSIGNEDSHORT, true],
	[BaseType.XSERROR, true],
	[BaseType.XSENTITIES, true],
	[BaseType.XSIDREF, true],
	[BaseType.XSID, true],
	[BaseType.XSIDREFS, true],
	[BaseType.XSNOTATION, true],
	[BaseType.XSANYSIMPLETYPE, true],
	[BaseType.XSANYATOMICTYPE, true],
	[BaseType.ATTRIBUTE, false],
	[BaseType.XSNORMALIZEDSTRING, true],
	[BaseType.XSNMTOKENS, true],
	[BaseType.XSNMTOKEN, true],
	[BaseType.XSLANGUAGE, true],
	[BaseType.XSTOKEN, true],
	[BaseType.NODE, false],
	[BaseType.ELEMENT, false],
	[BaseType.DOCUMENTNODE, false],
	[BaseType.TEXT, false],
	[BaseType.PROCESSINGINSTRUCTION, false],
	[BaseType.COMMENT, false],
	[BaseType.ITEM, false],
	[BaseType.FUNCTION, false],
	[BaseType.MAP, false],
	[BaseType.ARRAY, false],
]);

/**
 * Creates a string value from a base type, generally follows the 'xs:type' notation, where
 * xs stands for XML Schema
 * @param input The base type to get the string of
 * @returns A string corresponding to that base type.
 */
export function baseTypeToString(input: BaseType): string {
	const typeToStringMap: Record<BaseType, string> = {
		[BaseType.XSBOOLEAN]: 'xs:boolean',
		[BaseType.XSSTRING]: 'xs:string',
		[BaseType.XSNUMERIC]: 'xs:numeric',
		[BaseType.XSDOUBLE]: 'xs:double',
		[BaseType.XSDECIMAL]: 'xs:decimal',
		[BaseType.XSINTEGER]: 'xs:integer',
		[BaseType.XSFLOAT]: 'xs:float',
		[BaseType.XSDATE]: 'xs:date',
		[BaseType.XSTIME]: 'xs:time',
		[BaseType.XSDATETIME]: 'xs:dateTime',
		[BaseType.XSDATETIMESTAMP]: 'xs:dateTimeStamp',
		[BaseType.XSGYEARMONTH]: 'xs:gYearMonth',
		[BaseType.XSGYEAR]: 'xs:gYear',
		[BaseType.XSGMONTHDAY]: 'xs:gMonthDay',
		[BaseType.XSGMONTH]: 'xs:gMonth',
		[BaseType.XSGDAY]: 'xs:gDay',
		[BaseType.XSYEARMONTHDURATION]: 'xs:yearMonthDuration',
		[BaseType.XSDAYTIMEDURATION]: 'xs:dayTimeDuration',
		[BaseType.XSDURATION]: 'xs:duration',
		[BaseType.XSUNTYPEDATOMIC]: 'xs:untypedAtomic',
		[BaseType.XSANYURI]: 'xs:anyURI',
		[BaseType.XSBASE64BINARY]: 'xs:base64Binary',
		[BaseType.XSHEXBINARY]: 'xs:hexBinary',
		[BaseType.XSQNAME]: 'xs:QName',
		[BaseType.XSNCNAME]: 'xs:NCName',
		[BaseType.XSNAME]: 'xs:Name',
		[BaseType.XSENTITY]: 'xs:ENTITY',
		[BaseType.XSNONPOSITIVEINTEGER]: 'xs:nonPositiveInteger',
		[BaseType.XSNEGATIVEINTEGER]: 'xs:negativeInteger',
		[BaseType.XSPOSITIVEINTEGER]: 'xs:positiveInteger',
		[BaseType.XSNONNEGATIVEINTEGER]: 'xs:nonNegativeInteger',
		[BaseType.XSLONG]: 'xs:long',
		[BaseType.XSINT]: 'xs:int',
		[BaseType.XSSHORT]: 'xs:short',
		[BaseType.XSBYTE]: 'xs:byte',
		[BaseType.XSUNSIGNEDINT]: 'xs:unsignedInt',
		[BaseType.XSUNSIGNEDLONG]: 'xs:unsignedLong',
		[BaseType.XSUNSIGNEDBYTE]: 'xs:unsignedByte',
		[BaseType.XSUNSIGNEDSHORT]: 'xs:unsignedShort',
		[BaseType.XSERROR]: 'xs:error',
		[BaseType.XSENTITIES]: 'xs:ENTITIES',
		[BaseType.XSIDREF]: 'xs:IDREF',
		[BaseType.XSID]: 'xs:ID',
		[BaseType.XSIDREFS]: 'xs:IDFREFS',
		[BaseType.XSNOTATION]: 'xs:NOTATION',
		[BaseType.XSANYSIMPLETYPE]: 'xs:anySimpleType',
		[BaseType.XSANYATOMICTYPE]: 'xs:anyAtomicType',
		[BaseType.ATTRIBUTE]: 'attribute()',
		[BaseType.XSNORMALIZEDSTRING]: 'xs:normalizedString',
		[BaseType.XSNMTOKENS]: 'xs:NMTOKENS',
		[BaseType.XSNMTOKEN]: 'xs:NMTOKEN',
		[BaseType.XSLANGUAGE]: 'xs:language',
		[BaseType.XSTOKEN]: 'xs:token',
		[BaseType.NODE]: 'node()',
		[BaseType.ELEMENT]: 'element()',
		[BaseType.DOCUMENTNODE]: 'document-node()',
		[BaseType.TEXT]: 'text()',
		[BaseType.PROCESSINGINSTRUCTION]: 'processing-instruction()',
		[BaseType.COMMENT]: 'comment()',
		[BaseType.ITEM]: 'item()',
		[BaseType.FUNCTION]: 'function(*)',
		[BaseType.MAP]: 'map(*)',
		[BaseType.ARRAY]: 'array(*)',
	};

	const stringVal = typeToStringMap[input];
	if (stringVal === undefined || stringVal === null) {
		throw new Error(`Cannot convert BaseType of type "${input}" to a string`);
	}
	return stringVal;
}