import { SequenceMultiplicity, ValueType } from '../Value';
import { Variety } from '../Variety';

type BuildinModelTypeDeclaration = {
	base?: ValueType;
	memberTypes?: ValueType[];
	name: ValueType;
	parent?: ValueType;
	restrictions?: { [s: string]: string | number };
	type?: ValueType;
	variety: Variety;
};

const builtinModels: BuildinModelTypeDeclaration[] = [
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.ITEM,
	},

	// anyAtomicType
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSANYATOMICTYPE,
		parent: ValueType.ITEM,
		restrictions: {
			whiteSpace: 'preserve',
		},
	},

	// untypedAtomic
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSUNTYPEDATOMIC,
		parent: ValueType.XSANYATOMICTYPE,
	},

	// string
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSSTRING,
		parent: ValueType.XSANYATOMICTYPE,
	},

	// boolean
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSBOOLEAN,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// decimal
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSDECIMAL,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// float
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSFLOAT,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// double
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSDOUBLE,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// duration
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSDURATION,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTime
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSDATETIME,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// time
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSTIME,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// date
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSDATE,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYearMonth
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSGYEARMONTH,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYear
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSGYEAR,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonthDay
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSGMONTHDAY,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gDay
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSGDAY,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonth
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSGMONTH,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// hexBinary
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSHEXBINARY,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// base64Binary
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSBASE64BINARY,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// anyURI
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSANYURI,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// QName
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSQNAME,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// NOTATION
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSNOTATION,
		parent: ValueType.XSANYATOMICTYPE,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTimeStamp
	{
		variety: Variety.DERIVED,
		name: ValueType.XSDATETIMESTAMP,
		base: ValueType.XSDATETIME,
		restrictions: {
			whiteSpace: 'collapse', // fixed
			explicitTimezone: 'required', // fixed
		},
	},

	// normalizedString
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNORMALIZEDSTRING,
		base: ValueType.XSSTRING,
		restrictions: {
			whiteSpace: 'replace',
		},
	},

	// token
	{
		variety: Variety.DERIVED,
		name: ValueType.XSTOKEN,
		base: ValueType.XSNORMALIZEDSTRING,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// language (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSLANGUAGE,
		base: ValueType.XSTOKEN,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKEN (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNMTOKEN,
		base: ValueType.XSTOKEN,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKENS
	{
		variety: Variety.LIST,
		name: ValueType.XSNMTOKENS,
		type: ValueType.XSNMTOKEN,
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// Name (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNAME,
		base: ValueType.XSTOKEN,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NCName (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNCNAME,
		base: ValueType.XSNAME,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ID (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSID,
		base: ValueType.XSNCNAME,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREF (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSIDREF,
		base: ValueType.XSNCNAME,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREFS
	{
		variety: Variety.LIST,
		name: ValueType.XSIDREFS,
		type: ValueType.XSIDREF,
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// ENTITY (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSENTITY,
		base: ValueType.XSNCNAME,
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ENTITIES
	{
		variety: Variety.LIST,
		name: ValueType.XSENTITIES,
		type: ValueType.XSENTITY,
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// integer (TODO: implement pattern)
	{
		variety: Variety.PRIMITIVE,
		name: ValueType.XSINTEGER,
		parent: ValueType.XSDECIMAL,
		restrictions: {
			fractionDigits: 0, // fixed
			whiteSpace: 'collapse', // fixed
		},
	},

	// nonPositiveInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNONPOSITIVEINTEGER,
		base: ValueType.XSINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// negativeInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNEGATIVEINTEGER,
		base: ValueType.XSNONPOSITIVEINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '-1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// long (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSLONG,
		base: ValueType.XSINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '9223372036854775807',
			minInclusive: '-9223372036854775808',
			whiteSpace: 'collapse', // fixed
		},
	},

	// int (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSINT,
		base: ValueType.XSLONG,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '2147483647',
			minInclusive: '-2147483648',
			whiteSpace: 'collapse', // fixed
		},
	},

	// short (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSSHORT,
		base: ValueType.XSINT,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '32767',
			minInclusive: '-32768',
			whiteSpace: 'collapse', // fixed
		},
	},

	// byte (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSBYTE,
		base: ValueType.XSSHORT,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '127',
			minInclusive: '-128',
			whiteSpace: 'collapse', // fixed
		},
	},

	// nonNegativeInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSNONNEGATIVEINTEGER,
		base: ValueType.XSINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedLong (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSUNSIGNEDLONG,
		base: ValueType.XSNONNEGATIVEINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '18446744073709551615',
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedInt (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSUNSIGNEDINT,
		base: ValueType.XSUNSIGNEDLONG,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '4294967295',
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedShort (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSUNSIGNEDSHORT,
		base: ValueType.XSUNSIGNEDINT,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '65535',
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedByte (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSUNSIGNEDBYTE,
		base: ValueType.XSUNSIGNEDSHORT,
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '255',
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// positiveInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSPOSITIVEINTEGER,
		base: ValueType.XSNONNEGATIVEINTEGER,
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// yearMonthDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSYEARMONTHDURATION,
		base: ValueType.XSDURATION,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dayTimeDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: ValueType.XSDAYTIMEDURATION,
		base: ValueType.XSDURATION,
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.FUNCTION,
		base: ValueType.ITEM,
	},

	{
		variety: Variety.UNION,
		name: ValueType.XSERROR,
		memberTypes: [],
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.MAP,
		base: ValueType.FUNCTION,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.ARRAY,
		base: ValueType.FUNCTION,
	},

	{
		variety: Variety.PRIMITIVE,
		name: ValueType.NODE,
		parent: ValueType.ITEM,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.ELEMENT,
		base: ValueType.NODE,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.COMMENT,
		base: ValueType.NODE,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.ATTRIBUTE,
		base: ValueType.NODE,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.TEXT,
		base: ValueType.NODE,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.PROCESSINGINSTRUCTION,
		base: ValueType.NODE,
	},

	{
		variety: Variety.DERIVED,
		name: ValueType.DOCUMENTNODE,
		base: ValueType.NODE,
	},

	{
		variety: Variety.UNION,
		name: ValueType.XSNUMERIC,
		memberTypes: [
			ValueType.XSDECIMAL,
			ValueType.XSINTEGER,
			ValueType.XSFLOAT,
			ValueType.XSDOUBLE,
		],
	},
];

export default builtinModels;
