import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import SequenceFactory from '../dataTypes/sequenceFactory';
import { normalizeWhitespace, validatePattern } from '../dataTypes/typeHelpers';
import QName from '../dataTypes/valueTypes/QName';

import { XMLSCHEMA_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

function genericDataTypeConstructor(
	dataType,
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return SequenceFactory.singleton(castToType(sequence.first(), dataType));
}

const xsQName: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	staticContext,
	sequence
) {
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
		const namespaceURI = staticContext.resolveNamespace('');
		return SequenceFactory.singleton(
			createAtomicValue(new QName('', namespaceURI, lexicalQName), 'xs:QName')
		);
	}
	const [prefix, localName] = lexicalQName.split(':');
	const namespaceURI = staticContext.resolveNamespace(prefix);
	if (!namespaceURI) {
		throw new Error(
			`FONS0004: The value ${lexicalQName} can not be cast to a QName. Did you mean to use fn:QName?`
		);
	}
	return SequenceFactory.singleton(
		createAtomicValue(new QName(prefix, namespaceURI, localName), 'xs:QName')
	);
};

export default {
	declarations: [
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'untypedAtomic',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:untypedAtomic?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:untypedAtomic'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'error',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:error?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:error'
			) as FunctionDefinitionType
		},
		// AnySimpleType cannot be instantiated
		// AnyAtomicType cannot be instantiated
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'string',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:string?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:string'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'boolean',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:boolean?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:boolean'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'decimal',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:decimal?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:decimal'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'float',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:float?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:float'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'double',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:double?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:double'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'duration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:duration?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:duration'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTime',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:dateTime'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTime?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:dateTimeStamp'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'time',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:time?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:time') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'date',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:date?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:date') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYearMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYearMonth?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:gYearMonth'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYear',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gYear?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:gYear'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonthDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonthDay?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:gMonthDay'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gDay',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gDay?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:gDay') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonth',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:gMonth?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:gMonth'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'hexBinary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:hexBinary?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:hexBinary'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'base64Binary',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:base64Binary?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:base64Binary'
			) as FunctionDefinitionType
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
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:anyURI'
			) as FunctionDefinitionType
		},
		// NOTATION cannot be instantiated
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'normalizedString',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:normalizedString?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:normalizedString'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'token',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:token?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:token'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'language',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:language?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:language'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKEN',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKEN?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:NMTOKEN'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKENS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NMTOKENS*',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:NMTOKENS'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'Name',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:Name?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:Name') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NCName',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:NCName?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:NCName'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ID',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ID?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:ID') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREF',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREF?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:IDREF'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREFS',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:IDREFS*',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:IDREFS'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITY',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITY?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:ENTITY'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITIES',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:ENTITIES*',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:ENTITIES'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'integer',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:integer?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:integer'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonPositiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonPositiveInteger?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:nonPositiveInteger'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'negativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:negativeInteger?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:negativeInteger'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'long',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:long?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:long') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'int',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:int?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:int') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'short',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:short?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:short'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'byte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:byte?',
			callFunction: genericDataTypeConstructor.bind(null, 'xs:byte') as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonNegativeInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:nonNegativeInteger?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:nonNegativeInteger'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedLong',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedLong?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:unsignedLong'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedInt',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedInt?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:unsignedInt'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedShort',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedShort?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:unsignedShort'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedByte',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:unsignedByte?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:unsignedByte'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'positiveInteger',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:positiveInteger?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:positiveInteger'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'yearMonthDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:yearMonthDuration?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:yearMonthDuration'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dayTimeDuration',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dayTimeDuration?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:dayTimeDuration'
			) as FunctionDefinitionType
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: ['xs:anyAtomicType?'],
			returnType: 'xs:dateTimeStamp?',
			callFunction: genericDataTypeConstructor.bind(
				null,
				'xs:dateTimeStamp'
			) as FunctionDefinitionType
		}
	]
};
