/**
 * A single value in XPath
 *
 * For internal use
 *
 * @public
 */
export default class Value {
	constructor(public type: ValueType, readonly value: any) {}
}

/**
 * All implemented types in XPath
 *
 * @public
 */
export type ValueType =
	| 'xs:boolean'
	| 'xs:string'
	| 'xs:numeric'
	| 'xs:double'
	| 'xs:decimal'
	| 'xs:integer'
	| 'xs:float'
	| 'xs:date'
	| 'xs:time'
	| 'xs:dateTime'
	| 'xs:dateTimeStamp'
	| 'xs:gYearMonth'
	| 'xs:gYear'
	| 'xs:gMonthDay'
	| 'xs:gMonth'
	| 'xs:gDay'
	| 'xs:yearMonthDuration'
	| 'xs:dayTimeDuration'
	| 'xs:duration'
	| 'xs:untypedAtomic'
	| 'xs:anyURI'
	| 'xs:base64Binary'
	| 'xs:hexBinary'
	| 'xs:QName'
	| 'xs:NCName'
	| 'xs:Name'
	| 'xs:ENTITY'
	| 'xs:nonPositiveInteger'
	| 'xs:negativeInteger'
	| 'xs:positiveInteger'
	| 'xs:nonNegativeInteger'
	| 'xs:long'
	| 'xs:int'
	| 'xs:short'
	| 'xs:byte'
	| 'xs:unsignedInt'
	| 'xs:unsignedLong'
	| 'xs:unsignedByte'
	| 'xs:unsignedShort'
	| 'xs:error'
	| 'xs:ENTITIES'
	| 'xs:IDREF'
	| 'xs:ID'
	| 'xs:IDREFS'
	| 'xs:NOTATION'
	| 'xs:anySimpleType'
	| 'xs:anyAtomicType'
	| 'attribute()'
	| 'xs:normalizedString'
	| 'xs:NMTOKENS'
	| 'xs:NMTOKEN'
	| 'xs:language'
	| 'xs:token'
	| 'node()'
	| 'element()'
	| 'document-node()'
	| 'text()'
	| 'processing-instruction()'
	| 'comment()'
	| 'item()'
	| 'function(*)'
	| 'map(*)'
	| 'array(*)';
