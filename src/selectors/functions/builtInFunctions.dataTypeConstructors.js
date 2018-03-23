import Sequence from '../dataTypes/Sequence';
import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import QName from '../dataTypes/valueTypes/QName';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import { validatePattern, normalizeWhitespace } from '../dataTypes/typeHelpers';

import { XMLSCHEMA_NAMESPACE_URI } from '../staticallyKnownNamespaces';

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
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'untypedAtomic',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:untypedAtomic?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:untypedAtomic')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'error',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:error?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:error')
		},
		// AnySimpleType cannot be instantiated
		// AnyAtomicType cannot be instantiated
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:string?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:string')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'boolean',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:boolean?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:boolean')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'decimal',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:decimal?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:decimal')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'float',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:float?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:float')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'double',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:double')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'duration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:duration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:duration')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTime',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTime')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTimeStamp')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'time',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:time?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:time')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'date',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:date?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:date')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYearMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYearMonth?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gYearMonth')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYear',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYear?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gYear')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonthDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonthDay?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gMonthDay')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gDay?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gDay')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonth?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gMonth')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'hexBinary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:hexBinary?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:hexBinary')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'base64Binary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:base64Binary?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:base64Binary')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'QName',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:QName?',
			callFunction: xsQName
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'anyURI',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:anyURI?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:anyURI')
		},
		// NOTATION cannot be instantiated
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'normalizedString',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:normalizedString?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:normalizedString')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'token',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:token?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:token')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'language',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:language?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:language')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKEN',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKEN?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NMTOKEN')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKENS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKENS*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NMTOKENS')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'Name',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:Name?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:Name')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NCName',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NCName?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:NCName')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ID',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ID?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ID')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREF',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREF?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:IDREF')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREFS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREFS*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:IDREFS')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITY',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITY?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ENTITY')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITIES',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITIES*',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ENTITIES')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'integer',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:integer?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:integer')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonPositiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonPositiveInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:nonPositiveInteger')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'negativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:negativeInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:negativeInteger')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'long',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:long?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:long')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'int',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:int?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:int')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'short',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:short?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:short')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'byte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:byte?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:byte')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonNegativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonNegativeInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:nonNegativeInteger')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedLong',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedLong?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedLong')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedInt',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedInt?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedInt')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedShort',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedShort?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedShort')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedByte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedByte?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:unsignedByte')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'positiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:positiveInteger?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:positiveInteger')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'yearMonthDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:yearMonthDuration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:yearMonthDuration')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dayTimeDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dayTimeDuration')
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTimeStamp?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:dateTimeStamp')
		}
	]
};
