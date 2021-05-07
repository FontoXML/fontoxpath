import { BaseType } from '../BaseType';
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
		name: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	// anyAtomicType
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'preserve',
		},
	},

	// untypedAtomic
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	// string
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSSTRING, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	// boolean
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSBOOLEAN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// decimal
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDECIMAL, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// float
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSFLOAT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// double
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDOUBLE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// duration
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDURATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTime
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDATETIME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// time
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSTIME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// date
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSDATE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYearMonth
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGYEARMONTH, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gYear
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGYEAR, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonthDay
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGMONTHDAY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gDay
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGDAY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// gMonth
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSGMONTH, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse', // fixed
		},
	},

	// hexBinary
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSHEXBINARY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// base64Binary
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSBASE64BINARY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// anyURI
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSANYURI, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// QName
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSQNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// NOTATION
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSNOTATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSANYATOMICTYPE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dateTimeStamp
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSDATETIMESTAMP, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSDATETIME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
			explicitTimezone: 'required', // fixed
		},
	},

	// normalizedString
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNORMALIZEDSTRING, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSSTRING, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'replace',
		},
	},

	// token
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNORMALIZEDSTRING, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// language (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSLANGUAGE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKEN (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNMTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NMTOKENS
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSNMTOKENS, seqType: SequenceMultiplicity.EXACTLY_ONE },
		type: { kind: BaseType.XSNMTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// Name (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSTOKEN, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// NCName (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNCNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ID (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSID, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNCNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREF (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSIDREF, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNCNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// IDREFS
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSIDREFS, seqType: SequenceMultiplicity.EXACTLY_ONE },
		type: { kind: BaseType.XSIDREF, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// ENTITY (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSENTITY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNCNAME, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse',
		},
	},

	// ENTITIES
	{
		variety: Variety.LIST,
		name: { kind: BaseType.XSENTITIES, seqType: SequenceMultiplicity.EXACTLY_ONE },
		type: { kind: BaseType.XSENTITY, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse',
		},
	},

	// integer (TODO: implement pattern)
	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.XSINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.XSDECIMAL, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			fractionDigits: 0, // fixed
			whiteSpace: 'collapse', // fixed
		},
	},

	// nonPositiveInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNONPOSITIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// negativeInteger (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSNEGATIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNONPOSITIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '-1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// long (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSLONG, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSINT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSLONG, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSSHORT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSINT, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSBYTE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSSHORT, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSNONNEGATIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '0',
			whiteSpace: 'collapse', // fixed
		},
	},

	// unsignedLong (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSUNSIGNEDLONG, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNONNEGATIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSUNSIGNEDINT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSUNSIGNEDLONG, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSUNSIGNEDSHORT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSUNSIGNEDINT, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSUNSIGNEDBYTE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSUNSIGNEDSHORT, seqType: SequenceMultiplicity.EXACTLY_ONE },
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
		name: { kind: BaseType.XSPOSITIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSNONNEGATIVEINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '1',
			whiteSpace: 'collapse', // fixed
		},
	},

	// yearMonthDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSYEARMONTHDURATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSDURATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	// dayTimeDuration (TODO: implement pattern)
	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.XSDURATION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		restrictions: {
			whiteSpace: 'collapse', // fixed
		},
	},

	{
		variety: Variety.DERIVED,
		name: {
			kind: BaseType.FUNCTION,
			returnType: undefined,
			params: [],
			seqType: SequenceMultiplicity.EXACTLY_ONE,
		},
		base: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.UNION,
		name: { kind: BaseType.XSERROR, seqType: SequenceMultiplicity.EXACTLY_ONE },
		memberTypes: [],
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.MAP, items: [], seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: {
			kind: BaseType.FUNCTION,
			returnType: undefined,
			params: [],
			seqType: SequenceMultiplicity.EXACTLY_ONE,
		},
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ARRAY, items: [], seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: {
			kind: BaseType.FUNCTION,
			returnType: undefined,
			params: [],
			seqType: SequenceMultiplicity.EXACTLY_ONE,
		},
	},

	{
		variety: Variety.PRIMITIVE,
		name: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		parent: { kind: BaseType.ITEM, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ELEMENT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.COMMENT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.ATTRIBUTE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.TEXT, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.PROCESSINGINSTRUCTION, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.DERIVED,
		name: { kind: BaseType.DOCUMENTNODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		base: { kind: BaseType.NODE, seqType: SequenceMultiplicity.EXACTLY_ONE },
	},

	{
		variety: Variety.UNION,
		name: { kind: BaseType.XSNUMERIC, seqType: SequenceMultiplicity.EXACTLY_ONE },
		memberTypes: [
			{ kind: BaseType.XSDECIMAL, seqType: SequenceMultiplicity.EXACTLY_ONE },
			{ kind: BaseType.XSINTEGER, seqType: SequenceMultiplicity.EXACTLY_ONE },
			{ kind: BaseType.XSFLOAT, seqType: SequenceMultiplicity.EXACTLY_ONE },
			{ kind: BaseType.XSDOUBLE, seqType: SequenceMultiplicity.EXACTLY_ONE },
		],
	},
];

export default builtinModels;
