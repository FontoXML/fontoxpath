import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { validatePattern, normalizeWhitespace } from '../dataTypes/typeHelpers';

function genericDataTypeConstructor (dataType, _dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return Sequence.singleton(castToType(sequence.first(), dataType));
}

function xsQName (dynamicContext, sequence) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	const value = sequence.first();
	if (isSubtypeOf(value.type, 'xs:numeric')) {
		// This won't ever work
		throw new Error('XPTY0004: The provided QName is not a string-like value.');
	}
	let lexicalQName = castToType(value, 'xs:string').value;
	// Test lexical scope
	lexicalQName = normalizeWhitespace(lexicalQName, 'xs:QName');
	if (!validatePattern(lexicalQName, 'xs:QName')) {
		throw new Error('FORG0001: The provided QName is invalid.');
	}
	if (!lexicalQName.includes(':')) {
		// Only a local part
		const namespaceURI = dynamicContext.resolveNamespacePrefix('');
		return Sequence.singleton(createAtomicValue(new QName('', namespaceURI, lexicalQName), 'xs:QName'));
	}
	const [prefix, localPart] = lexicalQName.split(':');
	const namespaceURI = dynamicContext.resolveNamespacePrefix(prefix);
	if (!namespaceURI) {
		throw new Error(`FONS0004: The value ${lexicalQName} can not be casted to a QName. Did you mean to use fn:QName?`);
	}
	return Sequence.singleton(createAtomicValue(new QName(prefix, namespaceURI, localPart), 'xs:QName'));
}

export default {
	declarations: [
		{
			name: 'xs:untypedAtomic',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:untypedAtomic?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:untypedAtomic')
		},
		{
			name: 'xs:error',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:error?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:error')
		},
		// AnySimpleType cannot be instantiated
		// AnyAtomicType cannot be instantiated
		{
			name: 'xs:string',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:string?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:string')
		},
		{
			name: 'xs:boolean',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:boolean?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:boolean')
		},
		{
			name: 'xs:decimal',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:decimal?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:decimal')
		},
		{
			name: 'xs:float',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:float?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:float')
		},
		{
			name: 'xs:double',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:double')
		},
		{
			name: 'xs:duration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:duration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:duration')
		},
		{
			name: 'xs:dateTime',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTime')
		},
		{
			name: 'xs:dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTimeStamp')
		},
		{
			name: 'xs:time',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:time?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:time')
		},
		{
			name: 'xs:date',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:date?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:date')
		},
		{
			name: 'xs:gYearMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYearMonth?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gYearMonth')
		},
		{
			name: 'xs:gYear',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYear?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gYear')
		},
		{
			name: 'xs:gMonthDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonthDay?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gMonthDay')
		},
		{
			name: 'xs:gDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gDay?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gDay')
		},
		{
			name: 'xs:gMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonth?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gMonth')
		},
		{
			name: 'xs:hexBinary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:hexBinary?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:hexBinary')
		},
		{
			name: 'xs:base64Binary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:base64Binary?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:base64Binary')
		},
		{
			name: 'xs:QName',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:QName?',
			callFunction: xsQName
		},
		{
			name: 'xs:anyURI',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:anyURI?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:anyURI')
		},
		// NOTATION cannot be instantiated
		{
			name: 'xs:normalizedString',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:normalizedString?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:normalizedString')
		},
		{
			name: 'xs:token',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:token?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:token')
		},
		{
			name: 'xs:language',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:language?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:language')
		},
		{
			name: 'xs:NMTOKEN',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKEN?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NMTOKEN')
		},
		{
			name: 'xs:NMTOKENS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKENS*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NMTOKENS')
		},
		{
			name: 'xs:Name',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:Name?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:Name')
		},
		{
			name: 'xs:NCName',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NCName?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NCName')
		},
		{
			name: 'xs:ID',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ID?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ID')
		},
		{
			name: 'xs:IDREF',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREF?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:IDREF')
		},
		{
			name: 'xs:IDREFS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREFS*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:IDREFS')
		},
		{
			name: 'xs:ENTITY',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITY?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ENTITY')
		},
		{
			name: 'xs:ENTITIES',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITIES*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ENTITIES')
		},
		{
			name: 'xs:integer',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:integer?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:integer')
		},
		{
			name: 'xs:nonPositiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonPositiveInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:nonPositiveInteger')
		},
		{
			name: 'xs:negativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:negativeInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:negativeInteger')
		},
		{
			name: 'xs:long',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:long?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:long')
		},
		{
			name: 'xs:int',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:int?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:int')
		},
		{
			name: 'xs:short',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:short?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:short')
		},
		{
			name: 'xs:byte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:byte?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:byte')
		},
		{
			name: 'xs:nonNegativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonNegativeInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:nonNegativeInteger')
		},
		{
			name: 'xs:unsignedLong',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedLong?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedLong')
		},
		{
			name: 'xs:unsignedInt',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedInt?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedInt')
		},
		{
			name: 'xs:unsignedShort',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedShort?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedShort')
		},
		{
			name: 'xs:unsignedByte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedByte?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedByte')
		},
		{
			name: 'xs:positiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:positiveInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:positiveInteger')
		},
		{
			name: 'xs:yearMonthDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:yearMonthDuration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:yearMonthDuration')
		},
		{
			name: 'xs:dayTimeDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dayTimeDuration')
		},
		{
			name: 'xs:dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTimeStamp?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTimeStamp')
		}
	]
};
