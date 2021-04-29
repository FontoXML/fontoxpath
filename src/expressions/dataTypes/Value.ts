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
	switch (input) {
		case 'xs:boolean':
			return { kind: BaseType.XSBOOLEAN };
		case 'xs:string':
			return { kind: BaseType.XSSTRING };
		case 'xs:numeric':
			return { kind: BaseType.XSNUMERIC };
		case 'xs:double':
			return { kind: BaseType.XSDOUBLE };
		case 'xs:decimal':
			return { kind: BaseType.XSDECIMAL };
		case 'xs:integer':
			return { kind: BaseType.XSINTEGER };
		case 'xs:float':
			return { kind: BaseType.XSFLOAT };
		case 'xs:date':
			return { kind: BaseType.XSDATE };
		case 'xs:time':
			return { kind: BaseType.XSTIME };
		case 'xs:dateTime':
			return { kind: BaseType.XSDATETIME };
		case 'xs:dateTimeStamp':
			return { kind: BaseType.XSDATETIMESTAMP };
		case 'xs:gYearMonth':
			return { kind: BaseType.XSGYEARMONTH };
		case 'xs:gYear':
			return { kind: BaseType.XSGYEAR };
		case 'xs:gMonthDay':
			return { kind: BaseType.XSGMONTHDAY };
		case 'xs:gMonth':
			return { kind: BaseType.XSGMONTH };
		case 'xs:gDay':
			return { kind: BaseType.XSGDAY };
		case 'xs:yearMonthDuration':
			return { kind: BaseType.XSYEARMONTHDURATION };
		case 'xs:dayTimeDuration':
			return { kind: BaseType.XSDAYTIMEDURATION };
		case 'xs:duration':
			return { kind: BaseType.XSDURATION };
		case 'xs:untypedAtomic':
			return { kind: BaseType.XSUNTYPEDATOMIC };
		case 'xs:anyURI':
			return { kind: BaseType.XSANYURI };
		case 'xs:base64Binary':
			return { kind: BaseType.XSBASE64BINARY };
		case 'xs:hexBinary':
			return { kind: BaseType.XSHEXBINARY };
		case 'xs:QName':
			return { kind: BaseType.XSQNAME };
		case 'xs:NCName':
			return { kind: BaseType.XSNCNAME };
		case 'xs:Name':
			return { kind: BaseType.XSNAME };
		case 'xs:ENTITY':
			return { kind: BaseType.XSENTITY };
		case 'xs:nonPositiveInteger':
			return { kind: BaseType.XSNONPOSITIVEINTEGER };
		case 'xs:negativeInteger':
			return { kind: BaseType.XSNEGATIVEINTEGER };
		case 'xs:positiveInteger':
			return { kind: BaseType.XSPOSITIVEINTEGER };
		case 'xs:nonNegativeInteger':
			return { kind: BaseType.XSNONNEGATIVEINTEGER };
		case 'xs:long':
			return { kind: BaseType.XSLONG };
		case 'xs:int':
			return { kind: BaseType.XSINT };
		case 'xs:short':
			return { kind: BaseType.XSSHORT };
		case 'xs:byte':
			return { kind: BaseType.XSBYTE };
		case 'xs:unsignedInt':
			return { kind: BaseType.XSUNSIGNEDINT };
		case 'xs:unsignedLong':
			return { kind: BaseType.XSUNSIGNEDLONG };
		case 'xs:unsignedByte':
			return { kind: BaseType.XSUNSIGNEDBYTE };
		case 'xs:unsignedShort':
			return { kind: BaseType.XSUNSIGNEDSHORT };
		case 'xs:error':
			return { kind: BaseType.XSERROR };
		case 'xs:ENTITIES':
			return { kind: BaseType.XSENTITIES };
		case 'xs:IDREF':
			return { kind: BaseType.XSIDREF };
		case 'xs:ID':
			return { kind: BaseType.XSID };
		case 'xs:IDREFS':
			return { kind: BaseType.XSIDREFS };
		case 'xs:NOTATION':
			return { kind: BaseType.XSNOTATION };
		case 'xs:anySimpleType':
			return { kind: BaseType.XSANYSIMPLETYPE };
		case 'xs:anyAtomicType':
			return { kind: BaseType.XSANYATOMICTYPE };
		case 'attribute()':
			return { kind: BaseType.ATTRIBUTE };
		case 'xs:normalizedString':
			return { kind: BaseType.XSNORMALIZEDSTRING };
		case 'xs:NMTOKENS':
			return { kind: BaseType.XSNMTOKENS };
		case 'xs:NMTOKEN':
			return { kind: BaseType.XSNMTOKEN };
		case 'xs:language':
			return { kind: BaseType.XSLANGUAGE };
		case 'xs:token':
			return { kind: BaseType.XSTOKEN };
		case 'node()':
			return { kind: BaseType.NODE };
		case 'element()':
			return { kind: BaseType.ELEMENT };
		case 'document-node()':
			return { kind: BaseType.DOCUMENTNODE };
		case 'text()':
			return { kind: BaseType.TEXT };
		case 'processing-instruction()':
			return { kind: BaseType.PROCESSINGINSTRUCTION };
		case 'comment()':
			return { kind: BaseType.COMMENT };
		case 'item()':
			return { kind: BaseType.ITEM };
		case 'function(*)':
			return { kind: BaseType.FUNCTION, returnType: undefined, params: [] };
		case 'map(*)':
			return { kind: BaseType.MAP, items: [] };
		case 'array(*)':
			return { kind: BaseType.ARRAY, items: [] };
		default:
			throw new Error(`Cannot convert String of type "${input}" to ValueType`);
	}
}
