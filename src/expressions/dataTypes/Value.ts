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
	| { kind: BaseType.XSBOOLEAN; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSSTRING; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNUMERIC; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDOUBLE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDECIMAL; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSINTEGER; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSFLOAT; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDATE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSTIME; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDATETIME; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDATETIMESTAMP; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSGYEARMONTH; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSGYEAR; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSGMONTHDAY; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSGMONTH; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSGDAY; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSYEARMONTHDURATION; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDAYTIMEDURATION; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSDURATION; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSUNTYPEDATOMIC; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSANYURI; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSBASE64BINARY; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSHEXBINARY; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSQNAME; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNCNAME; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNAME; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSENTITY; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNONPOSITIVEINTEGER; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNEGATIVEINTEGER; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSPOSITIVEINTEGER; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNONNEGATIVEINTEGER; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSLONG; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSINT; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSSHORT; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSBYTE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSUNSIGNEDINT; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSUNSIGNEDLONG; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSUNSIGNEDBYTE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSUNSIGNEDSHORT; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSERROR; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSENTITIES; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSIDREF; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSID; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSIDREFS; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNOTATION; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSANYSIMPLETYPE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSANYATOMICTYPE; occurence?: OccurenceIndicator }
	| { kind: BaseType.ATTRIBUTE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNORMALIZEDSTRING; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNMTOKENS; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSNMTOKEN; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSLANGUAGE; occurence?: OccurenceIndicator }
	| { kind: BaseType.XSTOKEN; occurence?: OccurenceIndicator }
	| { kind: BaseType.NODE; occurence?: OccurenceIndicator }
	| { kind: BaseType.ELEMENT; occurence?: OccurenceIndicator }
	| { kind: BaseType.DOCUMENTNODE; occurence?: OccurenceIndicator }
	| { kind: BaseType.TEXT; occurence?: OccurenceIndicator }
	| { kind: BaseType.PROCESSINGINSTRUCTION; occurence?: OccurenceIndicator }
	| { kind: BaseType.COMMENT; occurence?: OccurenceIndicator }
	| { kind: BaseType.ITEM; occurence?: OccurenceIndicator }
	| {
			kind: BaseType.FUNCTION;
			params: ValueType[];
			returnType: ValueType | undefined;
			occurence?: OccurenceIndicator;
	  }
	| {
			kind: BaseType.MAP;
			items: [ValueType, ValueType][];
			occurence?: OccurenceIndicator;
	  }
	| { kind: BaseType.ARRAY; items: ValueType[]; occurence?: OccurenceIndicator }
	// item types, sequence types, function args = seq + "..."
	| { kind: BaseType.ELLIPSIS; occurence?: OccurenceIndicator };

/**
 * Handles the occurances in the XPath specs.
 * Zero or one '?' => NULLABLE;
 * One or more '+' => SOME;
 * Zero or more '*' => ANY;
 * Exactly one, empty, singleton, multiple.
 */
export enum OccurenceIndicator {
	// Nullable refers to the '?' symbol: zero or one occurance
	NULLABLE,
	// Some refers to the '+' symbol: one or more occurances
	SOME,
	// Any refers to the '*' zero or more occurances
	ANY,
}

/**
 * Recursively creates a hash for a type and its potential subtypes
 * @param type Input type to get the hash from
 * @returns A hash number
 */
export function valueTypeHash(type: ValueType): number {
	const prime = 31;
	let result = type.kind as number;

	switch (type.kind) {
		case BaseType.FUNCTION:
			result =
				prime * result +
				(type.returnType === undefined ? 0 : valueTypeHash(type.returnType));
			for (const param of type.params) {
				result = prime * result + valueTypeHash(param);
			}
			break;
		case BaseType.MAP:
			for (const keyVal of type.items) {
				result = prime * result + valueTypeHash(keyVal[0]);
				result = prime * result + valueTypeHash(keyVal[1]);
			}
			break;
		case BaseType.ARRAY:
			for (const item of type.items) {
				result = prime * result + valueTypeHash(item);
			}
			break;
		case BaseType.NULLABLE:
		case BaseType.ANY:
		case BaseType.SOME:
			result = prime * result + valueTypeHash(type.item);
			break;
	}

	return result;
}

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
		[BaseType.ELLIPSIS]: '...',
		[BaseType.NULLABLE]: '?',
		[BaseType.ANY]: '*',
		[BaseType.SOME]: '+',
	};

	const stringVal = typeToStringMap[input];
	if (stringVal === undefined || stringVal === null) {
		throw new Error(`Cannot convert BaseType of type "${input}" to a string`);
	}
	return stringVal;
}
/**
 * Converts a ValueType to the correct string representation
 *
 * @param input the ValueType
 * @returns the correct string representation of the type
 */
export function valueTypeToString(input: ValueType): string {
	if (input.occurence === OccurenceIndicator.ANY) {
		return baseTypeToString(input.kind) + '*';
	}
	if (input.occurence === OccurenceIndicator.SOME) {
		return baseTypeToString(input.kind) + '+';
	}
	if (input.occurence === OccurenceIndicator.NULLABLE) {
		return baseTypeToString(input.kind) + '?';
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

	const typeVal = stringToTypeMap[input];
	if (typeVal === undefined || typeVal === null) {
		throw new Error(`XPST0051: Cannot convert String of type "${input}" to ValueType`);
	}
	return typeVal;
}
