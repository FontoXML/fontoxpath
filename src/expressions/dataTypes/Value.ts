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
export const enum ParameterType {
	ZERO_OR_ONE = SequenceType.ZERO_OR_ONE,
	ONE_OR_MORE = SequenceType.ONE_OR_MORE,
	ZERO_OR_MORE = SequenceType.ZERO_OR_MORE,
	EXACTLY_ONE = SequenceType.EXACTLY_ONE,
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
 * The composite type containing more info
 * @public
 */
export type ValueType = GenericValueType<SequenceType>;

/**
 * The composite type containing more info for parameters
 * @public
 */
export type ParameterValueType = GenericValueType<ParameterType>;

/**
 * The generic composite type
 * @public
 */
export type GenericValueType<T> =
	| { kind: BaseType.XSBOOLEAN; seqType: T }
	| { kind: BaseType.XSSTRING; seqType: T }
	| { kind: BaseType.XSNUMERIC; seqType: T }
	| { kind: BaseType.XSDOUBLE; seqType: T }
	| { kind: BaseType.XSDECIMAL; seqType: T }
	| { kind: BaseType.XSINTEGER; seqType: T }
	| { kind: BaseType.XSFLOAT; seqType: T }
	| { kind: BaseType.XSDATE; seqType: T }
	| { kind: BaseType.XSTIME; seqType: T }
	| { kind: BaseType.XSDATETIME; seqType: T }
	| { kind: BaseType.XSDATETIMESTAMP; seqType: T }
	| { kind: BaseType.XSGYEARMONTH; seqType: T }
	| { kind: BaseType.XSGYEAR; seqType: T }
	| { kind: BaseType.XSGMONTHDAY; seqType: T }
	| { kind: BaseType.XSGMONTH; seqType: T }
	| { kind: BaseType.XSGDAY; seqType: T }
	| { kind: BaseType.XSYEARMONTHDURATION; seqType: T }
	| { kind: BaseType.XSDAYTIMEDURATION; seqType: T }
	| { kind: BaseType.XSDURATION; seqType: T }
	| { kind: BaseType.XSUNTYPEDATOMIC; seqType: T }
	| { kind: BaseType.XSANYURI; seqType: T }
	| { kind: BaseType.XSBASE64BINARY; seqType: T }
	| { kind: BaseType.XSHEXBINARY; seqType: T }
	| { kind: BaseType.XSQNAME; seqType: T }
	| { kind: BaseType.XSNCNAME; seqType: T }
	| { kind: BaseType.XSNAME; seqType: T }
	| { kind: BaseType.XSENTITY; seqType: T }
	| { kind: BaseType.XSNONPOSITIVEINTEGER; seqType: T }
	| { kind: BaseType.XSNEGATIVEINTEGER; seqType: T }
	| { kind: BaseType.XSPOSITIVEINTEGER; seqType: T }
	| { kind: BaseType.XSNONNEGATIVEINTEGER; seqType: T }
	| { kind: BaseType.XSLONG; seqType: T }
	| { kind: BaseType.XSINT; seqType: T }
	| { kind: BaseType.XSSHORT; seqType: T }
	| { kind: BaseType.XSBYTE; seqType: T }
	| { kind: BaseType.XSUNSIGNEDINT; seqType: T }
	| { kind: BaseType.XSUNSIGNEDLONG; seqType: T }
	| { kind: BaseType.XSUNSIGNEDBYTE; seqType: T }
	| { kind: BaseType.XSUNSIGNEDSHORT; seqType: T }
	| { kind: BaseType.XSERROR; seqType: T }
	| { kind: BaseType.XSENTITIES; seqType: T }
	| { kind: BaseType.XSIDREF; seqType: T }
	| { kind: BaseType.XSID; seqType: T }
	| { kind: BaseType.XSIDREFS; seqType: T }
	| { kind: BaseType.XSNOTATION; seqType: T }
	| { kind: BaseType.XSANYSIMPLETYPE; seqType: T }
	| { kind: BaseType.XSANYATOMICTYPE; seqType: T }
	| { kind: BaseType.ATTRIBUTE; seqType: T }
	| { kind: BaseType.XSNORMALIZEDSTRING; seqType: T }
	| { kind: BaseType.XSNMTOKENS; seqType: T }
	| { kind: BaseType.XSNMTOKEN; seqType: T }
	| { kind: BaseType.XSLANGUAGE; seqType: T }
	| { kind: BaseType.XSTOKEN; seqType: T }
	| { kind: BaseType.NODE; seqType: T }
	| { kind: BaseType.ELEMENT; seqType: T }
	| { kind: BaseType.DOCUMENTNODE; seqType: T }
	| { kind: BaseType.TEXT; seqType: T }
	| { kind: BaseType.PROCESSINGINSTRUCTION; seqType: T }
	| { kind: BaseType.COMMENT; seqType: T }
	| { kind: BaseType.ITEM; seqType: T }
	| {
			kind: BaseType.FUNCTION;
			seqType: T;
			params: GenericValueType<T>[];
			returnType: ValueType | undefined;
	  }
	| {
			items: [GenericValueType<T>, GenericValueType<T>][];
			kind: BaseType.MAP;
			seqType: T;
	  }
	| { items: GenericValueType<T>[]; kind: BaseType.ARRAY; seqType: T };

// export function parameterValueTypeToValueType(type: ParameterValueType): ValueType {
// 	let newType;
// 	switch (type.seqType) {
// 		case ParameterType.EXACTLY_ONE:
// 			newType = SequenceType.EXACTLY_ONE;
// 			break;
// 		case ParameterType.ONE_OR_MORE:
// 			newType = SequenceType.ONE_OR_MORE;
// 			break;
// 		case ParameterType.ZERO_OR_ONE:
// 			newType = SequenceType.ZERO_OR_ONE;
// 			break;
// 		case ParameterType.ZERO_OR_MORE:
// 			newType = SequenceType.ZERO_OR_MORE;
// 			break;
// 		default:
// 			throw new Error(`Trying to convert parameter value type ${type} to value type`);
// 	}
// }

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
export function valueTypeToString(input: ValueType | ParameterValueType): string {
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
export function stringToValueType<T = ParameterType | SequenceType>(
	input: string,
	seqType: T
): GenericValueType<T> {
	if (!input.startsWith('xs:') && input.indexOf(':') >= 0) {
		throw new Error('XPST0081: Invalid prefix for input ' + input);
	}

	const stringToTypeMap: { [key: string]: GenericValueType<T> } = {
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
