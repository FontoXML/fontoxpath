import { BaseType, ValueType } from '../Value';

type BuildinModelTypeDeclaration = {
	base?: ValueType;
	memberTypes?: ValueType[];
	name: ValueType;
	parent?: ValueType;
	restrictions?: { [s: string]: string | number };
	type?: ValueType;
	variety: string;
};

const builtinModels: BuildinModelTypeDeclaration[] = [
	{
		variety: 'primitive',
		name: { kind: BaseType.ITEM },
	},

	// anyAtomicType
	{
		variety: 'primitive',
		name: { kind: BaseType.XSANYATOMICTYPE },
		parent: { kind: BaseType.ITEM },
		restrictions: {
			whiteSpace: 'preserve',
		},
	},

	// untypedAtomic
	{
		variety: 'primitive',
		name: { kind: BaseType.XSUNTYPEDATOMIC },
		parent: { kind: BaseType.XSANYATOMICTYPE },
	},

	// string
	{
		variety: 'primitive',
		name: { kind: BaseType.XSSTRING },
		parent: { kind: BaseType.XSANYATOMICTYPE },
	},

	// boolean
	{
		variety: 'primitive',
		name: { kind: BaseType.XSBOOLEAN },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// decimal
	{
		variety: 'primitive',
		name: { kind: BaseType.XSDECIMAL },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// float
	{
		variety: 'primitive',
		name: { kind: BaseType.XSFLOAT },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// double
	{
		variety: 'primitive',
		name: { kind: BaseType.XSDOUBLE },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// duration
	{
		variety: 'primitive',
		name: { kind: BaseType.XSDURATION },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTime
	{
		variety: 'primitive',
		name: { kind: BaseType.XSDATETIME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// time
	{
		variety: 'primitive',
		name: { kind: BaseType.XSTIME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// date
	{
		variety: 'primitive',
		name: { kind: BaseType.XSDATE },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYearMonth
	{
		variety: 'primitive',
		name: { kind: BaseType.XSGYEARMONTH },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYear
	{
		variety: 'primitive',
		name: { kind: BaseType.XSGYEAR },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonthDay
	{
		variety: 'primitive',
		name: { kind: BaseType.XSGMONTHDAY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gDay
	{
		variety: 'primitive',
		name: { kind: BaseType.XSGDAY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonth
	{
		variety: 'primitive',
		name: { kind: BaseType.XSGMONTH },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// hexBinary
	{
		variety: 'primitive',
		name: { kind: BaseType.XSHEXBINARY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// base64Binary
	{
		variety: 'primitive',
		name: { kind: BaseType.XSBASE64BINARY },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// anyURI
	{
		variety: 'primitive',
		name: { kind: BaseType.XSANYURI },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// QName
	{
		variety: 'primitive',
		name: { kind: BaseType.XSQNAME },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// NOTATION
	{
		variety: 'primitive',
		name: { kind: BaseType.XSNOTATION },
		parent: { kind: BaseType.XSANYATOMICTYPE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTimeStamp
	{
		variety: 'derived',
		name: { kind: BaseType.XSDATETIMESTAMP },
		base: { kind: BaseType.XSDATETIME },
		restrictions: {
			whiteSpace: 'collapse', // fixed
			explicitTimezone: 'required', // fixed
		},
	},

	// normalizedString
	{
		variety: 'derived',
		name: { kind: BaseType.XSNORMALIZEDSTRING },
		base: { kind: BaseType.XSSTRING },
		restrictions: {
			whiteSpace: 'replace',
		},
	},

	// token
	{
		variety: 'derived',
		name: { kind: BaseType.XSTOKEN },
		base: { kind: BaseType.XSNORMALIZEDSTRING },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// language (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSLANGUAGE },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKEN (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSNMTOKEN },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKENS
	{
		variety: 'list',
		name: { kind: BaseType.XSNMTOKENS },
		type: { kind: BaseType.XSNMTOKENS },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// Name (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSNAME },
		base: { kind: BaseType.XSTOKEN },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NCName (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSNCNAME },
		base: { kind: BaseType.XSNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ID (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSID },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREF (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSIDREF },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREFS
	{
		variety: 'list',
		name: { kind: BaseType.XSIDREFS },
		type: { kind: BaseType.XSIDREF },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// ENTITY (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSENTITY },
		base: { kind: BaseType.XSNCNAME },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ENTITIES
	{
		variety: 'list',
		name: { kind: BaseType.XSENTITIES },
		type: { kind: BaseType.XSENTITY },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// integer (TODO: implement pattern)
	{
		variety: 'primitive',
		name: { kind: BaseType.XSINTEGER },
		parent: { kind: BaseType.XSDECIMAL },
		restrictions: {
			fractionDigits: 0, // fixed
			whiteSpace: 'collapse', // fixed
		},
	},

	// nonPositiveInteger (TODO: implement pattern)
	{
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
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
		variety: 'derived',
		name: { kind: BaseType.XSYEARMONTHDURATION },
		base: { kind: BaseType.XSDURATION },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dayTimeDuration (TODO: implement pattern)
	{
		variety: 'derived',
		name: { kind: BaseType.XSDAYTIMEDURATION },
		base: { kind: BaseType.XSDURATION },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	{
		variety: 'derived',
		name: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
		base: { kind: BaseType.ITEM },
	},

	{
		variety: 'union',
		name: { kind: BaseType.XSERROR },
		memberTypes: [],
	},

	{
		variety: 'derived',
		name: { kind: BaseType.MAP, items: [] },
		base: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.ARRAY, items: [] },
		base: { kind: BaseType.FUNCTION, returnType: undefined, params: [] },
	},

	{
		variety: 'primitive',
		name: { kind: BaseType.NODE },
		parent: { kind: BaseType.ITEM },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.ELEMENT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.COMMENT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.ATTRIBUTE },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.TEXT },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.PROCESSINGINSTRUCTION },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'derived',
		name: { kind: BaseType.DOCUMENTNODE },
		base: { kind: BaseType.NODE },
	},

	{
		variety: 'union',
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
