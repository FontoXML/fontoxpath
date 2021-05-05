// The actual type is type ValueValue = NodePointer | Function | string | number | boolean | QName | Duration | DateTime; but doing that gives us thousands of errors.
type ValueValue = any;

export default class Value {
	constructor(public type: ValueType, readonly value: ValueValue) {}
}

/**
 * The base types within the program.
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
 * Handles the occurances in the XPath specs.
 * Zero or one matches to '?';
 * One or more matches to '+';
 * Zero or more matches to '*'
 * @public
 */
export const enum SequenceType {
	ZERO_OR_ONE = 0,
	ONE_OR_MORE = 1,
	ZERO_OR_MORE = 2,
	EXACTLY_ONE = 3,
}

/**
 * A superset of the SequenceType that also includes the ellipsis operator '...'
 * @public
 */
export const enum EllipsisType {
	ELLIPSIS = 4,
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
]);

/**
 * The generic composite type
 * @public
 */
export type ValueType =
	| { kind: BaseType.XSBOOLEAN; seqType: SequenceType }
	| { kind: BaseType.XSSTRING; seqType: SequenceType }
	| { kind: BaseType.XSNUMERIC; seqType: SequenceType }
	| { kind: BaseType.XSDOUBLE; seqType: SequenceType }
	| { kind: BaseType.XSDECIMAL; seqType: SequenceType }
	| { kind: BaseType.XSINTEGER; seqType: SequenceType }
	| { kind: BaseType.XSFLOAT; seqType: SequenceType }
	| { kind: BaseType.XSDATE; seqType: SequenceType }
	| { kind: BaseType.XSTIME; seqType: SequenceType }
	| { kind: BaseType.XSDATETIME; seqType: SequenceType }
	| { kind: BaseType.XSDATETIMESTAMP; seqType: SequenceType }
	| { kind: BaseType.XSGYEARMONTH; seqType: SequenceType }
	| { kind: BaseType.XSGYEAR; seqType: SequenceType }
	| { kind: BaseType.XSGMONTHDAY; seqType: SequenceType }
	| { kind: BaseType.XSGMONTH; seqType: SequenceType }
	| { kind: BaseType.XSGDAY; seqType: SequenceType }
	| { kind: BaseType.XSYEARMONTHDURATION; seqType: SequenceType }
	| { kind: BaseType.XSDAYTIMEDURATION; seqType: SequenceType }
	| { kind: BaseType.XSDURATION; seqType: SequenceType }
	| { kind: BaseType.XSUNTYPEDATOMIC; seqType: SequenceType }
	| { kind: BaseType.XSANYURI; seqType: SequenceType }
	| { kind: BaseType.XSBASE64BINARY; seqType: SequenceType }
	| { kind: BaseType.XSHEXBINARY; seqType: SequenceType }
	| { kind: BaseType.XSQNAME; seqType: SequenceType }
	| { kind: BaseType.XSNCNAME; seqType: SequenceType }
	| { kind: BaseType.XSNAME; seqType: SequenceType }
	| { kind: BaseType.XSENTITY; seqType: SequenceType }
	| { kind: BaseType.XSNONPOSITIVEINTEGER; seqType: SequenceType }
	| { kind: BaseType.XSNEGATIVEINTEGER; seqType: SequenceType }
	| { kind: BaseType.XSPOSITIVEINTEGER; seqType: SequenceType }
	| { kind: BaseType.XSNONNEGATIVEINTEGER; seqType: SequenceType }
	| { kind: BaseType.XSLONG; seqType: SequenceType }
	| { kind: BaseType.XSINT; seqType: SequenceType }
	| { kind: BaseType.XSSHORT; seqType: SequenceType }
	| { kind: BaseType.XSBYTE; seqType: SequenceType }
	| { kind: BaseType.XSUNSIGNEDINT; seqType: SequenceType }
	| { kind: BaseType.XSUNSIGNEDLONG; seqType: SequenceType }
	| { kind: BaseType.XSUNSIGNEDBYTE; seqType: SequenceType }
	| { kind: BaseType.XSUNSIGNEDSHORT; seqType: SequenceType }
	| { kind: BaseType.XSERROR; seqType: SequenceType }
	| { kind: BaseType.XSENTITIES; seqType: SequenceType }
	| { kind: BaseType.XSIDREF; seqType: SequenceType }
	| { kind: BaseType.XSID; seqType: SequenceType }
	| { kind: BaseType.XSIDREFS; seqType: SequenceType }
	| { kind: BaseType.XSNOTATION; seqType: SequenceType }
	| { kind: BaseType.XSANYSIMPLETYPE; seqType: SequenceType }
	| { kind: BaseType.XSANYATOMICTYPE; seqType: SequenceType }
	| { kind: BaseType.ATTRIBUTE; seqType: SequenceType }
	| { kind: BaseType.XSNORMALIZEDSTRING; seqType: SequenceType }
	| { kind: BaseType.XSNMTOKENS; seqType: SequenceType }
	| { kind: BaseType.XSNMTOKEN; seqType: SequenceType }
	| { kind: BaseType.XSLANGUAGE; seqType: SequenceType }
	| { kind: BaseType.XSTOKEN; seqType: SequenceType }
	| { kind: BaseType.NODE; seqType: SequenceType }
	| { kind: BaseType.ELEMENT; seqType: SequenceType }
	| { kind: BaseType.DOCUMENTNODE; seqType: SequenceType }
	| { kind: BaseType.TEXT; seqType: SequenceType }
	| { kind: BaseType.PROCESSINGINSTRUCTION; seqType: SequenceType }
	| { kind: BaseType.COMMENT; seqType: SequenceType }
	| { kind: BaseType.ITEM; seqType: SequenceType }
	| {
			kind: BaseType.FUNCTION;
			seqType: SequenceType;
			params: ValueType[];
			returnType: ValueType | undefined;
	  }
	| {
			items: [ValueType, ValueType][];
			kind: BaseType.MAP;
			seqType: SequenceType;
	  }
	| { items: ValueType[]; kind: BaseType.ARRAY; seqType: SequenceType };

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
	if (input.seqType === SequenceType.ZERO_OR_MORE) {
		return baseTypeToString(input.kind) + '*';
	}
	if (input.seqType === SequenceType.ONE_OR_MORE) {
		return baseTypeToString(input.kind) + '+';
	}
	if (input.seqType === SequenceType.ZERO_OR_ONE) {
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
	if (!input.startsWith('xs:') && input.indexOf(':') >= 0) {
		throw new Error('XPST0081: Invalid prefix for input ' + input);
	}

	const seqType = SequenceType.EXACTLY_ONE;

	const stringToTypeMap: { [key: string]: ValueType } = {
		'xs:boolean': { kind: BaseType.XSBOOLEAN, seqType },
		'xs:string': { kind: BaseType.XSSTRING, seqType },
		'xs:numeric': { kind: BaseType.XSNUMERIC, seqType },
		'xs:double': { kind: BaseType.XSDOUBLE, seqType },
		'xs:decimal': { kind: BaseType.XSDECIMAL, seqType },
		'xs:integer': { kind: BaseType.XSINTEGER, seqType },
		'xs:float': { kind: BaseType.XSFLOAT, seqType },
		'xs:date': { kind: BaseType.XSDATE, seqType },
		'xs:time': { kind: BaseType.XSTIME, seqType },
		'xs:dateTime': { kind: BaseType.XSDATETIME, seqType },
		'xs:dateTimeStamp': { kind: BaseType.XSDATETIMESTAMP, seqType },
		'xs:gYearMonth': { kind: BaseType.XSGYEARMONTH, seqType },
		'xs:gYear': { kind: BaseType.XSGYEAR, seqType },
		'xs:gMonthDay': { kind: BaseType.XSGMONTHDAY, seqType },
		'xs:gMonth': { kind: BaseType.XSGMONTH, seqType },
		'xs:gDay': { kind: BaseType.XSGDAY, seqType },
		'xs:yearMonthDuration': {
			kind: BaseType.XSYEARMONTHDURATION,
			seqType,
		},
		'xs:dayTimeDuration': {
			kind: BaseType.XSDAYTIMEDURATION,
			seqType,
		},
		'xs:duration': { kind: BaseType.XSDURATION, seqType },
		'xs:untypedAtomic': { kind: BaseType.XSUNTYPEDATOMIC, seqType },
		'xs:anyURI': { kind: BaseType.XSANYURI, seqType },
		'xs:base64Binary': { kind: BaseType.XSBASE64BINARY, seqType },
		'xs:hexBinary': { kind: BaseType.XSHEXBINARY, seqType },
		'xs:QName': { kind: BaseType.XSQNAME, seqType },
		'xs:NCName': { kind: BaseType.XSNCNAME, seqType },
		'xs:Name': { kind: BaseType.XSNAME, seqType },
		'xs:ENTITY': { kind: BaseType.XSENTITY, seqType },
		'xs:nonPositiveInteger': {
			kind: BaseType.XSNONPOSITIVEINTEGER,
			seqType,
		},
		'xs:negativeInteger': {
			kind: BaseType.XSNEGATIVEINTEGER,
			seqType,
		},
		'xs:positiveInteger': {
			kind: BaseType.XSPOSITIVEINTEGER,
			seqType,
		},
		'xs:nonNegativeInteger': {
			kind: BaseType.XSNONNEGATIVEINTEGER,
			seqType,
		},
		'xs:long': { kind: BaseType.XSLONG, seqType },
		'xs:int': { kind: BaseType.XSINT, seqType },
		'xs:short': { kind: BaseType.XSSHORT, seqType },
		'xs:byte': { kind: BaseType.XSBYTE, seqType },
		'xs:unsignedInt': { kind: BaseType.XSUNSIGNEDINT, seqType },
		'xs:unsignedLong': { kind: BaseType.XSUNSIGNEDLONG, seqType },
		'xs:unsignedByte': { kind: BaseType.XSUNSIGNEDBYTE, seqType },
		'xs:unsignedShort': { kind: BaseType.XSUNSIGNEDSHORT, seqType },
		'xs:error': { kind: BaseType.XSERROR, seqType },
		'xs:ENTITIES': { kind: BaseType.XSENTITIES, seqType },
		'xs:IDREF': { kind: BaseType.XSIDREF, seqType },
		'xs:ID': { kind: BaseType.XSID, seqType },
		'xs:IDREFS': { kind: BaseType.XSIDREFS, seqType },
		'xs:NOTATION': { kind: BaseType.XSNOTATION, seqType },
		'xs:anySimpleType': { kind: BaseType.XSANYSIMPLETYPE, seqType },
		'xs:anyAtomicType': { kind: BaseType.XSANYATOMICTYPE, seqType },
		'attribute()': { kind: BaseType.ATTRIBUTE, seqType },
		'xs:normalizedString': {
			kind: BaseType.XSNORMALIZEDSTRING,
			seqType,
		},
		'xs:NMTOKENS': { kind: BaseType.XSNMTOKENS, seqType },
		'xs:NMTOKEN': { kind: BaseType.XSNMTOKEN, seqType },
		'xs:language': { kind: BaseType.XSLANGUAGE, seqType },
		'xs:token': { kind: BaseType.XSTOKEN, seqType },
		'node()': { kind: BaseType.NODE, seqType },
		'element()': { kind: BaseType.ELEMENT, seqType },
		'document-node()': { kind: BaseType.DOCUMENTNODE, seqType },
		'text()': { kind: BaseType.TEXT, seqType },
		'processing-instruction()': {
			kind: BaseType.PROCESSINGINSTRUCTION,
			seqType,
		},
		'comment()': { kind: BaseType.COMMENT, seqType },
		'item()': { kind: BaseType.ITEM, seqType },
		'function(*)': {
			kind: BaseType.FUNCTION,
			returnType: undefined,
			params: [],
			seqType,
		},
		'map(*)': { kind: BaseType.MAP, items: [], seqType },
		'array(*)': { kind: BaseType.ARRAY, items: [], seqType },
	};

	const typeVal = stringToTypeMap[input];
	if (typeVal === undefined || typeVal === null) {
		throw new Error(`XPST0051: Cannot convert String of type "${input}" to ValueType`);
	}
	return typeVal;
}
