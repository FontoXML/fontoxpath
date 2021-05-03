import { BaseType, ValueType } from '../Value';
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
		name: { kind: BaseType.ITEM },
	},

	// anyAtomicType
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSANYATOMICTYPE },
		parent: { kind: BaseType.ITEM },
		restrictions: {
			whiteSpace: 'preserve',
		},
	},

	// untypedAtomic
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSUNTYPEDATOMIC },
		parent: { kind: BaseType.XSANYATOMICTYPE },
	},

	// string
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSSTRING },
		parent: { kind: BaseType.XSANYATOMICTYPE },
	},

	// boolean
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSBOOLEAN },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// decimal
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDECIMAL },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// float
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSFLOAT },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// double
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDOUBLE },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// duration
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDURATION },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTime
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDATETIME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// time
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSTIME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// date
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDATE },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYearMonth
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGYEARMONTH },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYear
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGYEAR },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonthDay
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGMONTHDAY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gDay
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGDAY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonth
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGMONTH },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// hexBinary
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSHEXBINARY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// base64Binary
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSBASE64BINARY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// anyURI
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSANYURI },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// QName
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSQNAME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// NOTATION
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSNOTATION },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTimeStamp
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSDATETIMESTAMP },
		base: { kind: BaseType.XSDATETIME },
		restrictions: {
			whiteSpace: 'collapse', // fixed
			explicitTimezone: 'required', // fixed
		},
	},

	// normalizedString
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNORMALIZEDSTRING },
		base: { kind: BaseType.XSSTRING },
		restrictions: {
			whiteSpace: 'replace',
		},
	},

	// token
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSTOKEN },
		base: { kind: BaseType.XSNORMALIZEDSTRING },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// language (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSLANGUAGE },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKEN (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNMTOKEN },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKENS
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSNMTOKENS },
		type: { kind: BaseType.XSNMTOKENS },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// Name (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNAME },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NCName (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNCNAME },
		base: { kind: BaseType.XSNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ID (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSID },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREF (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSIDREF },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREFS
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSIDREFS },
		type: { kind: BaseType.XSIDREF },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// ENTITY (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSENTITY },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ENTITIES
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSENTITIES },
		type: { kind: BaseType.XSENTITY },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// integer (TODO: implement pattern)
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSINTEGER },
		parent: { kind: BaseType.XSDECIMAL },
		restrictions: {
			fractionDigits: 0, // fixed
			whiteSpace: 'collapse', // fixed
		},
	},

	// nonPositiveInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNONPOSITIVEINTEGER },
		base: { kind: BaseType.XSINTEGER },
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// negativeInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNEGATIVEINTEGER },
		base: { kind: BaseType.XSNONPOSITIVEINTEGER },
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '-1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// long (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSLONG },
		base: { kind: BaseType.XSINTEGER },
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
		name: { kind: BaseType.XSINT },
		base: { kind: BaseType.XSLONG },
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
		name: { kind: BaseType.XSSHORT },
		base: { kind: BaseType.XSINT },
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
		name: { kind: BaseType.XSBYTE },
		base: { kind: BaseType.XSSHORT },
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
		name: { kind: BaseType.XSNONNEGATIVEINTEGER },
		base: { kind: BaseType.XSINTEGER },
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedLong (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSUNSIGNEDLONG },
		base: { kind: BaseType.XSNONNEGATIVEINTEGER },
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
		name: { kind: BaseType.XSUNSIGNEDINT },
		base: { kind: BaseType.XSUNSIGNEDLONG },
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
		name: { kind: BaseType.XSUNSIGNEDSHORT },
		base: { kind: BaseType.XSUNSIGNEDINT },
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
		name: { kind: BaseType.XSUNSIGNEDBYTE },
		base: { kind: BaseType.XSUNSIGNEDSHORT },
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
		name: { kind: BaseType.XSPOSITIVEINTEGER },
		base: { kind: BaseType.XSNONNEGATIVEINTEGER },
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// yearMonthDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSYEARMONTHDURATION },
		base: { kind: BaseType.XSDURATION },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dayTimeDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSDAYTIMEDURATION },
		base: { kind: BaseType.XSDURATION },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
		base: { kind: BaseType.ITEM },
	},

	{
		variety: Variety.UNION,
		name: { kind: BaseType.XSERROR },
		memberTypes: [],
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.MAP, items: [] },
		base: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ARRAY, items: [] },
		base: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
	},

	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.NODE },
		parent: { kind: BaseType.ITEM },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ELEMENT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.COMMENT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ATTRIBUTE },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.TEXT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.PROCESSINGINSTRUCTION },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.DOCUMENTNODE },
		base: { kind: BaseType.NODE },
	},

	{
		variety: Variety.UNION,
		name: { kind: BaseType.XSNUMERIC },
		memberTypes: [
			{ kind: BaseType.XSDECIMAL },
			{ kind: BaseType.XSINTEGER },
			{ kind: BaseType.XSFLOAT },
			{ kind: BaseType.XSDOUBLE },
		],
	},
];

export default builtinModels;
