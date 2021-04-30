// The actual type is type ValueValue = NodePointer | Function | string | number | boolean | QName | Duration | DateTime; but doing that gives us thousands of errors.
type ValueValue = any;

export default class Value {
	constructor(public type: ValueType, readonly value: ValueValue) {}
}

/**
 * The base type
 * @public
 */
export enum BaseType {
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
	NULLABLE,
	ANY,
	SOME,
	ELLIPSIS,
}

export function startWithXS(inType: BaseType): boolean {
	return a[inType];
}

const a = new Map([
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
	[BaseType.NULLABLE, false],
	[BaseType.ANY, false],
	[BaseType.SOME, false],
	[BaseType.ELLIPSIS, false],
]);

/**
 * The composite type containing more info
 * @public
 */
export type ValueType =
	| { kind: BaseType.XSBOOLEAN }
	| { kind: BaseType.XSSTRING }
	| { kind: BaseType.XSNUMERIC }
	| { kind: BaseType.XSDOUBLE }
	| { kind: BaseType.XSDECIMAL }
	| { kind: BaseType.XSINTEGER }
	| { kind: BaseType.XSFLOAT }
	| { kind: BaseType.XSDATE }
	| { kind: BaseType.XSTIME }
	| { kind: BaseType.XSDATETIME }
	| { kind: BaseType.XSDATETIMESTAMP }
	| { kind: BaseType.XSGYEARMONTH }
	| { kind: BaseType.XSGYEAR }
	| { kind: BaseType.XSGMONTHDAY }
	| { kind: BaseType.XSGMONTH }
	| { kind: BaseType.XSGDAY }
	| { kind: BaseType.XSYEARMONTHDURATION }
	| { kind: BaseType.XSDAYTIMEDURATION }
	| { kind: BaseType.XSDURATION }
	| { kind: BaseType.XSUNTYPEDATOMIC }
	| { kind: BaseType.XSANYURI }
	| { kind: BaseType.XSBASE64BINARY }
	| { kind: BaseType.XSHEXBINARY }
	| { kind: BaseType.XSQNAME }
	| { kind: BaseType.XSNCNAME }
	| { kind: BaseType.XSNAME }
	| { kind: BaseType.XSENTITY }
	| { kind: BaseType.XSNONPOSITIVEINTEGER }
	| { kind: BaseType.XSNEGATIVEINTEGER }
	| { kind: BaseType.XSPOSITIVEINTEGER }
	| { kind: BaseType.XSNONNEGATIVEINTEGER }
	| { kind: BaseType.XSLONG }
	| { kind: BaseType.XSINT }
	| { kind: BaseType.XSSHORT }
	| { kind: BaseType.XSBYTE }
	| { kind: BaseType.XSUNSIGNEDINT }
	| { kind: BaseType.XSUNSIGNEDLONG }
	| { kind: BaseType.XSUNSIGNEDBYTE }
	| { kind: BaseType.XSUNSIGNEDSHORT }
	| { kind: BaseType.XSERROR }
	| { kind: BaseType.XSENTITIES }
	| { kind: BaseType.XSIDREF }
	| { kind: BaseType.XSID }
	| { kind: BaseType.XSIDREFS }
	| { kind: BaseType.XSNOTATION }
	| { kind: BaseType.XSANYSIMPLETYPE }
	| { kind: BaseType.XSANYATOMICTYPE }
	| { kind: BaseType.ATTRIBUTE }
	| { kind: BaseType.XSNORMALIZEDSTRING }
	| { kind: BaseType.XSNMTOKENS }
	| { kind: BaseType.XSNMTOKEN }
	| { kind: BaseType.XSLANGUAGE }
	| { kind: BaseType.XSTOKEN }
	| { kind: BaseType.NODE }
	| { kind: BaseType.ELEMENT }
	| { kind: BaseType.DOCUMENTNODE }
	| { kind: BaseType.TEXT }
	| { kind: BaseType.PROCESSINGINSTRUCTION }
	| { kind: BaseType.COMMENT }
	| { kind: BaseType.ITEM }
	| { kind: BaseType.FUNCTION; params: ValueType[]; returnType: ValueType | undefined }
	| { items: [ValueType, ValueType][]; kind: BaseType.MAP }
	| { items: ValueType[]; kind: BaseType.ARRAY }
	// item types, sequence types, function args = seq + "..."
	// zero or one, exactly one, one or more, empty, singleton, multiple
	| { item: ValueType; kind: BaseType.NULLABLE }
	| { item: ValueType; kind: BaseType.ANY }
	| { item: ValueType; kind: BaseType.SOME }
	| { kind: BaseType.ELLIPSIS };

export function valueTypeHash(type: ValueType): number {
	// TODO: incorporate item, returntype, ...
	return type.kind as number;
}

export function baseTypeToString(input: BaseType): string {
	switch (input) {
		case BaseType.XSBOOLEAN:
			return 'xs:boolean';
		case BaseType.XSSTRING:
			return 'xs:string';
		case BaseType.XSNUMERIC:
			return 'xs:numeric';
		case BaseType.XSDOUBLE:
			return 'xs:double';
		case BaseType.XSDECIMAL:
			return 'xs:decimal';
		case BaseType.XSINTEGER:
			return 'xs:integer';
		case BaseType.XSFLOAT:
			return 'xs:float';
		case BaseType.XSDATE:
			return 'xs:date';
		case BaseType.XSTIME:
			return 'xs:time';
		case BaseType.XSDATETIME:
			return 'xs:dateTime';
		case BaseType.XSDATETIMESTAMP:
			return 'xs:dateTimeStamp';
		case BaseType.XSGYEARMONTH:
			return 'xs:gYearMonth';
		case BaseType.XSGYEAR:
			return 'xs:gYear';
		case BaseType.XSGMONTHDAY:
			return 'xs:gMonthDay';
		case BaseType.XSGMONTH:
			return 'xs:gMonth';
		case BaseType.XSGDAY:
			return 'xs:gDay';
		case BaseType.XSYEARMONTHDURATION:
			return 'xs:yearMonthDuration';
		case BaseType.XSDAYTIMEDURATION:
			return 'xs:dayTimeDuration';
		case BaseType.XSDURATION:
			return 'xs:duration';
		case BaseType.XSUNTYPEDATOMIC:
			return 'xs:untypedAtomic';
		case BaseType.XSANYURI:
			return 'xs:anyURI';
		case BaseType.XSBASE64BINARY:
			return 'xs:base64Binary';
		case BaseType.XSHEXBINARY:
			return 'xs:hexBinary';
		case BaseType.XSQNAME:
			return 'xs:QName';
		case BaseType.XSNCNAME:
			return 'xs:NCName';
		case BaseType.XSNAME:
			return 'xs:Name';
		case BaseType.XSENTITY:
			return 'xs:ENTITY';
		case BaseType.XSNONPOSITIVEINTEGER:
			return 'xs:nonPositiveInteger';
		case BaseType.XSNEGATIVEINTEGER:
			return 'xs:negativeInteger';
		case BaseType.XSPOSITIVEINTEGER:
			return 'xs:positiveInteger';
		case BaseType.XSNONNEGATIVEINTEGER:
			return 'xs:nonNegativeInteger';
		case BaseType.XSLONG:
			return 'xs:long';
		case BaseType.XSINT:
			return 'xs:int';
		case BaseType.XSSHORT:
			return 'xs:short';
		case BaseType.XSBYTE:
			return 'xs:byte';
		case BaseType.XSUNSIGNEDINT:
			return 'xs:unsignedInt';
		case BaseType.XSUNSIGNEDLONG:
			return 'xs:unsignedLong';
		case BaseType.XSUNSIGNEDBYTE:
			return 'xs:unsignedByte';
		case BaseType.XSUNSIGNEDSHORT:
			return 'xs:unsignedShort';
		case BaseType.XSERROR:
			return 'xs:error';
		case BaseType.XSENTITIES:
			return 'xs:ENTITIES';
		case BaseType.XSIDREF:
			return 'xs:IDREF';
		case BaseType.XSID:
			return 'xs:ID';
		case BaseType.XSIDREFS:
			return 'xs:IDFREFS';
		case BaseType.XSNOTATION:
			return 'xs:NOTATION';
		case BaseType.XSANYSIMPLETYPE:
			return 'xs:anySimpleType';
		case BaseType.XSANYATOMICTYPE:
			return 'xs:anyAtomicType';
		case BaseType.ATTRIBUTE:
			return 'attribute()';
		case BaseType.XSNORMALIZEDSTRING:
			return 'xs:normalizedString';
		case BaseType.XSNMTOKENS:
			return 'xs:NMTOKENS';
		case BaseType.XSNMTOKEN:
			return 'xs:NMTOKEN';
		case BaseType.XSLANGUAGE:
			return 'xs:language';
		case BaseType.XSTOKEN:
			return 'xs:token';
		case BaseType.NODE:
			return 'node()';
		case BaseType.ELEMENT:
			return 'element()';
		case BaseType.DOCUMENTNODE:
			return 'document-node()';
		case BaseType.TEXT:
			return 'text()';
		case BaseType.PROCESSINGINSTRUCTION:
			return 'processing-instruction()';
		case BaseType.COMMENT:
			return 'comment()';
		case BaseType.ITEM:
			return 'item()';
		case BaseType.FUNCTION:
			return 'function(*)';
		case BaseType.MAP:
			return 'map(*)';
		case BaseType.ARRAY:
			return 'array(*)';
		case BaseType.ELLIPSIS:
			return '...';
	}
}

/**
 * Converts a ValueType to the correct string representation
 *
 * @param input the ValueType
 * @returns the correct string representation of the type
 */
export function valueTypeToString(input: ValueType): string {
	if (input.kind === BaseType.ANY) {
		return valueTypeToString(input.item) + '*';
	}
	if (input.kind === BaseType.SOME) {
		return valueTypeToString(input.item) + '+';
	}
	if (input.kind === BaseType.NULLABLE) {
		return valueTypeToString(input.item) + '?';
	}

	return baseTypeToString(input.kind);
}

/**
 * Maps the string representation of the types to the ValueType object.
 *
 * @param input type string of the form "xs:<type>".
 * @returns the corresponding ValueType object.
 * @throws Error if the type cannot be mapped from string to ValueType.
 */
export function stringToValueType(input: string): ValueType {
	const stringToTypeMap: { [key: string]: ValueType } = {
		'xs:boolean': { kind: BaseType.XSBOOLEAN },
		'xs:string': { kind: BaseType.XSSTRING },
		'xs:numeric': { kind: BaseType.XSNUMERIC },
		'xs:double': { kind: BaseType.XSDOUBLE },
		'xs:decimal': { kind: BaseType.XSDECIMAL },
		'xs:integer': { kind: BaseType.XSINTEGER },
		'xs:float': { kind: BaseType.XSFLOAT },
		'xs:date': { kind: BaseType.XSDATE },
		'xs:time': { kind: BaseType.XSTIME },
		'xs:dateTime': { kind: BaseType.XSDATETIME },
		'xs:dateTimeStamp': { kind: BaseType.XSDATETIMESTAMP },
		'xs:gYearMonth': { kind: BaseType.XSGYEARMONTH },
		'xs:gYear': { kind: BaseType.XSGYEAR },
		'xs:gMonthDay': { kind: BaseType.XSGMONTHDAY },
		'xs:gMonth': { kind: BaseType.XSGMONTH },
		'xs:gDay': { kind: BaseType.XSGDAY },
		'xs:yearMonthDuration': { kind: BaseType.XSYEARMONTHDURATION },
		'xs:dayTimeDuration': { kind: BaseType.XSDAYTIMEDURATION },
		'xs:duration': { kind: BaseType.XSDURATION },
		'xs:untypedAtomic': { kind: BaseType.XSUNTYPEDATOMIC },
		'xs:anyURI': { kind: BaseType.XSANYURI },
		'xs:base64Binary': { kind: BaseType.XSBASE64BINARY },
		'xs:hexBinary': { kind: BaseType.XSHEXBINARY },
		'xs:QName': { kind: BaseType.XSQNAME },
		'xs:NCName': { kind: BaseType.XSNCNAME },
		'xs:Name': { kind: BaseType.XSNAME },
		'xs:ENTITY': { kind: BaseType.XSENTITY },
		'xs:nonPositiveInteger': { kind: BaseType.XSNONPOSITIVEINTEGER },
		'xs:negativeInteger': { kind: BaseType.XSNEGATIVEINTEGER },
		'xs:positiveInteger': { kind: BaseType.XSPOSITIVEINTEGER },
		'xs:nonNegativeInteger': { kind: BaseType.XSNONNEGATIVEINTEGER },
		'xs:long': { kind: BaseType.XSLONG },
		'xs:int': { kind: BaseType.XSINT },
		'xs:short': { kind: BaseType.XSSHORT },
		'xs:byte': { kind: BaseType.XSBYTE },
		'xs:unsignedInt': { kind: BaseType.XSUNSIGNEDINT },
		'xs:unsignedLong': { kind: BaseType.XSUNSIGNEDLONG },
		'xs:unsignedByte': { kind: BaseType.XSUNSIGNEDBYTE },
		'xs:unsignedShort': { kind: BaseType.XSUNSIGNEDSHORT },
		'xs:error': { kind: BaseType.XSERROR },
		'xs:ENTITIES': { kind: BaseType.XSENTITIES },
		'xs:IDREF': { kind: BaseType.XSIDREF },
		'xs:ID': { kind: BaseType.XSID },
		'xs:IDREFS': { kind: BaseType.XSIDREFS },
		'xs:NOTATION': { kind: BaseType.XSNOTATION },
		'xs:anySimpleType': { kind: BaseType.XSANYSIMPLETYPE },
		'xs:anyAtomicType': { kind: BaseType.XSANYATOMICTYPE },
		'attribute()': { kind: BaseType.ATTRIBUTE },
		'xs:normalizedString': { kind: BaseType.XSNORMALIZEDSTRING },
		'xs:NMTOKENS': { kind: BaseType.XSNMTOKENS },
		'xs:NMTOKEN': { kind: BaseType.XSNMTOKEN },
		'xs:language': { kind: BaseType.XSLANGUAGE },
		'xs:token': { kind: BaseType.XSTOKEN },
		'node()': { kind: BaseType.NODE },
		'element()': { kind: BaseType.ELEMENT },
		'document-node()': { kind: BaseType.DOCUMENTNODE },
		'text()': { kind: BaseType.TEXT },
		'processing-instruction()': { kind: BaseType.PROCESSINGINSTRUCTION },
		'comment()': { kind: BaseType.COMMENT },
		'item()': { kind: BaseType.ITEM },
		'function(*)': { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
		'map(*)': { kind: BaseType.MAP, items: [] },
		'array(*)': { kind: BaseType.ARRAY, items: [] },
	};

	var typeVal = stringToTypeMap[input];
	if (typeVal === undefined || typeVal === null) {
		throw new Error(`Cannot convert String of type "${input}" to ValueType`);
	}
	return typeVal;
}

