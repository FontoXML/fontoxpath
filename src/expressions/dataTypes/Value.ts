// The actual type is type ValueValue = NodePointer | Function | string | number | boolean | QName | Duration | DateTime; but doing that gives us thousands of errors.
type ValueValue = any;

export default class Value {
	constructor(public type: ValueType, readonly value: ValueValue) {}
}

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
};

export function startWithXS(inType: BaseType): boolean {
	return a[inType]
};

let a = new Map([
	[ BaseType.XSBOOLEAN, true ],
	[ BaseType.XSSTRING, true ],
	[ BaseType.XSNUMERIC, true ],
	[ BaseType.XSDOUBLE, true ],
	[ BaseType.XSDECIMAL, true ],
	[ BaseType.XSINTEGER, true ],
	[ BaseType.XSFLOAT, true ],
	[ BaseType.XSDATE, true ],
	[ BaseType.XSTIME, true ],
	[ BaseType.XSDATETIME, true ],
	[ BaseType.XSDATETIMESTAMP, true ],
	[ BaseType.XSGYEARMONTH, true ],
	[ BaseType.XSGYEAR, true ],
	[ BaseType.XSGMONTHDAY, true ],
	[ BaseType.XSGMONTH, true ],
	[ BaseType.XSGDAY, true ],
	[ BaseType.XSYEARMONTHDURATION, true ],
	[ BaseType.XSDAYTIMEDURATION, true ],
	[ BaseType.XSDURATION, true ],
	[ BaseType.XSUNTYPEDATOMIC, true ],
	[ BaseType.XSANYURI, true ],
	[ BaseType.XSBASE64BINARY, true ],
	[ BaseType.XSHEXBINARY, true ],
	[ BaseType.XSQNAME, true ],
	[ BaseType.XSNCNAME, true ],
	[ BaseType.XSNAME, true ],
	[ BaseType.XSENTITY, true ],
	[ BaseType.XSNONPOSITIVEINTEGER, true ],
	[ BaseType.XSNEGATIVEINTEGER, true ],
	[ BaseType.XSPOSITIVEINTEGER, true ],
	[ BaseType.XSNONNEGATIVEINTEGER, true ],
	[ BaseType.XSLONG, true ],
	[ BaseType.XSINT, true ],
	[ BaseType.XSSHORT, true ],
	[ BaseType.XSBYTE, true ],
	[ BaseType.XSUNSIGNEDINT, true ],
	[ BaseType.XSUNSIGNEDLONG, true ],
	[ BaseType.XSUNSIGNEDBYTE, true ],
	[ BaseType.XSUNSIGNEDSHORT, true ],
	[ BaseType.XSERROR, true ],
	[ BaseType.XSENTITIES, true ],
	[ BaseType.XSIDREF, true ],
	[ BaseType.XSID, true ],
	[ BaseType.XSIDREFS, true ],
	[ BaseType.XSNOTATION, true ],
	[ BaseType.XSANYSIMPLETYPE, true ],
	[ BaseType.XSANYATOMICTYPE, true ],
	[ BaseType.ATTRIBUTE, false ],
	[ BaseType.XSNORMALIZEDSTRING, true ],
	[ BaseType.XSNMTOKENS, true ],
	[ BaseType.XSNMTOKEN, true ],
	[ BaseType.XSLANGUAGE, true ],
	[ BaseType.XSTOKEN, true ],
	[ BaseType.NODE, false ],
	[ BaseType.ELEMENT, false ],
	[ BaseType.DOCUMENTNODE, false ],
	[ BaseType.TEXT, false ],
	[ BaseType.PROCESSINGINSTRUCTION, false ],
	[ BaseType.COMMENT, false ],
	[ BaseType.ITEM, false ],
	[ BaseType.FUNCTION, false ],
	[ BaseType.MAP, false ],
	[ BaseType.ARRAY, false ],
	])

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
	| { kind: BaseType.FUNCTION; returnType: ValueType | undefined; param: ValueType[] }
	| { kind: BaseType.MAP; items: [ValueType, ValueType][] }
	| { kind: BaseType.ARRAY; items: ValueType[] };
