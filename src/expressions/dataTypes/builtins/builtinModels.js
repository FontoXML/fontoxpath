export default [
	{
		variety: 'primitive',
		name: 'item()'
	},

	// anyAtomicType
	{
		variety: 'primitive',
		name: 'xs:anyAtomicType',
		parent: 'item()',
		restrictions: {
			whiteSpace: 'preserve'
		}
	},

	// untypedAtomic
	{
		variety: 'primitive',
		name: 'xs:untypedAtomic',
		parent: 'xs:anyAtomicType'
	},

	// string
	{
		variety: 'primitive',
		name: 'xs:string',
		parent: 'xs:anyAtomicType'
	},

	// boolean
	{
		variety: 'primitive',
		name: 'xs:boolean',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// decimal
	{
		variety: 'primitive',
		name: 'xs:decimal',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// float
	{
		variety: 'primitive',
		name: 'xs:float',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// double
	{
		variety: 'primitive',
		name: 'xs:double',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// duration
	{
		variety: 'primitive',
		name: 'xs:duration',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// dateTime
	{
		variety: 'primitive',
		name: 'xs:dateTime',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// time
	{
		variety: 'primitive',
		name: 'xs:time',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// date
	{
		variety: 'primitive',
		name: 'xs:date',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// gYearMonth
	{
		variety: 'primitive',
		name: 'xs:gYearMonth',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// gYear
	{
		variety: 'primitive',
		name: 'xs:gYear',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// gMonthDay
	{
		variety: 'primitive',
		name: 'xs:gMonthDay',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// gDay
	{
		variety: 'primitive',
		name: 'xs:gDay',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// gMonth
	{
		variety: 'primitive',
		name: 'xs:gMonth',
		parent: 'xs:anyAtomicType',
		restrictions: {
			explicitTimezone: 'optional',
			whiteSpace: 'collapse' // fixed
		}
	},

	// hexBinary
	{
		variety: 'primitive',
		name: 'xs:hexBinary',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// base64Binary
	{
		variety: 'primitive',
		name: 'xs:base64Binary',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// anyURI
	{
		variety: 'primitive',
		name: 'xs:anyURI',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// QName
	{
		variety: 'primitive',
		name: 'xs:QName',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// NOTATION
	{
		variety: 'primitive',
		name: 'xs:NOTATION',
		parent: 'xs:anyAtomicType',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// dateTimeStamp
	{
		variety: 'derived',
		name: 'xs:dateTimeStamp',
		base: 'xs:dateTime',
		restrictions: {
			whiteSpace: 'collapse', // fixed
			explicitTimezone: 'required' // fixed
		}
	},

	// normalizedString
	{
		variety: 'derived',
		name: 'xs:normalizedString',
		base: 'xs:string',
		restrictions: {
			whiteSpace: 'replace'
		}
	},

	// token
	{
		variety: 'derived',
		name: 'xs:token',
		base: 'xs:normalizedString',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// language (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:language',
		base: 'xs:token',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// NMTOKEN (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:NMTOKEN',
		base: 'xs:token',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// NMTOKENS
	{
		variety: 'list',
		name: 'xs:NMTOKENS',
		type: 'NMTOKEN',
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse'
		}
	},

	// Name (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:Name',
		base: 'xs:token',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// NCName (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:NCName',
		base: 'xs:Name',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// ID (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:ID',
		base: 'xs:NCName',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// IDREF (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:IDREF',
		base: 'xs:NCName',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// IDREFS
	{
		variety: 'list',
		name: 'xs:IDREFS',
		type: 'IDREF',
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse'
		}
	},

	// ENTITY (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:ENTITY',
		base: 'xs:NCName',
		restrictions: {
			whiteSpace: 'collapse'
		}
	},

	// ENTITIES
	{
		variety: 'list',
		name: 'xs:ENTITIES',
		type: 'ENTITY',
		restrictions: {
			minLength: 1,
			whiteSpace: 'collapse'
		}
	},

	// integer (TODO: implement pattern)
	{
		variety: 'primitive',
		name: 'xs:integer',
		parent: 'xs:decimal',
		restrictions: {
			fractionDigits: 0, // fixed
			whiteSpace: 'collapse' // fixed
		}
	},

	// nonPositiveInteger (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:nonPositiveInteger',
		base: 'xs:integer',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// negativeInteger (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:negativeInteger',
		base: 'xs:nonPositiveInteger',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '-1',
			whiteSpace: 'collapse' // fixed
		}
	},

	// long (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:long',
		base: 'xs:integer',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '9223372036854775807',
			minInclusive: '-9223372036854775808',
			whiteSpace: 'collapse' // fixed
		}
	},

	// int (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:int',
		base: 'xs:long',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '2147483647',
			minInclusive: '-2147483648',
			whiteSpace: 'collapse' // fixed
		}
	},

	// short (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:short',
		base: 'xs:int',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '32767',
			minInclusive: '-32768',
			whiteSpace: 'collapse' // fixed
		}
	},

	// byte (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:byte',
		base: 'xs:short',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '127',
			minInclusive: '-128',
			whiteSpace: 'collapse' // fixed
		}
	},

	// nonNegativeInteger (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:nonNegativeInteger',
		base: 'xs:integer',
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// unsignedLong (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:unsignedLong',
		base: 'xs:nonNegativeInteger',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '18446744073709551615',
			minInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// unsignedInt (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:unsignedInt',
		base: 'xs:unsignedLong',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '4294967295',
			minInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// unsignedShort (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:unsignedShort',
		base: 'xs:unsignedInt',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '65535',
			minInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// unsignedByte (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:unsignedByte',
		base: 'xs:unsignedShort',
		restrictions: {
			fractionDigits: 0, // fixed
			maxInclusive: '255',
			minInclusive: '0',
			whiteSpace: 'collapse' // fixed
		}
	},

	// positiveInteger (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:positiveInteger',
		base: 'xs:nonNegativeInteger',
		restrictions: {
			fractionDigits: 0, // fixed
			minInclusive: '1',
			whiteSpace: 'collapse' // fixed
		}
	},

	// yearMonthDuration (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:yearMonthDuration',
		base: 'xs:duration',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	// dayTimeDuration (TODO: implement pattern)
	{
		variety: 'derived',
		name: 'xs:dayTimeDuration',
		base: 'xs:duration',
		restrictions: {
			whiteSpace: 'collapse' // fixed
		}
	},

	{
		variety: 'derived',
		name: 'function(*)',
		base: 'item()'
	},

	{
		variety: 'union',
		name: 'xs:error',
		memberTypes: []
	},

	{
		variety: 'derived',
		name: 'map(*)',
		base: 'function(*)'
	},

	{
		variety: 'derived',
		name: 'array(*)',
		base: 'function(*)'
	},

	{
		variety: 'primitive',
		name: 'node()',
		parent: 'item()'
	},

	{
		variety: 'derived',
		name: 'element()',
		base: 'node()'
	},

	{
		variety: 'derived',
		name: 'comment()',
		base: 'node()'
	},

	{
		variety: 'derived',
		name: 'attribute()',
		base: 'node()'
	},

	{
		variety: 'derived',
		name: 'text()',
		base: 'node()'
	},

	{
		variety: 'derived',
		name: 'processing-instruction()',
		base: 'node()'
	},

	{
		variety: 'derived',
		name: 'document()',
		base: 'node()'
	},

	{
		variety: 'union',
		name: 'xs:numeric',
		memberTypes: ['xs:decimal', 'xs:integer', 'xs:float', 'xs:double']
	}
];
