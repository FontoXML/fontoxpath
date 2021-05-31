import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { normalizeWhitespace, validatePattern } from '../dataTypes/typeHelpers';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import { XMLSCHEMA_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import StaticContext from '../StaticContext';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

function genericDataTypeConstructor(
	dataType: ValueType,
	_dynamicContext: DynamicContext,
	_executionParameters: ExecutionParameters,
	_staticContext: StaticContext,
	sequence: ISequence
) {
	if (sequence.isEmpty()) {
		return sequence;
	}
	return sequenceFactory.singleton(castToType(sequence.first(), dataType));
}

const xsQName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	staticContext,
	sequence
) => {
	if (sequence.isEmpty()) {
		return sequence;
	}
	const value = sequence.first();
	if (isSubtypeOf(value.type, ValueType.XSNUMERIC)) {
		// This won't ever work
		throw new Error('XPTY0004: The provided QName is not a string-like value.');
	}
	let lexicalQName = castToType(value, ValueType.XSSTRING).value;
	// Test lexical scope
	lexicalQName = normalizeWhitespace(lexicalQName, ValueType.XSQNAME);
	if (!validatePattern(lexicalQName, ValueType.XSQNAME)) {
		throw new Error('FORG0001: The provided QName is invalid.');
	}
	if (!lexicalQName.includes(':')) {
		// Only a local part
		const resolvedDefaultNamespaceURI = staticContext.resolveNamespace('');
		return sequenceFactory.singleton(
			createAtomicValue(
				new QName('', resolvedDefaultNamespaceURI, lexicalQName),
				ValueType.XSQNAME
			)
		);
	}
	const [prefix, localName] = lexicalQName.split(':');
	const namespaceURI = staticContext.resolveNamespace(prefix);
	if (!namespaceURI) {
		throw new Error(
			`FONS0004: The value ${lexicalQName} can not be cast to a QName. Did you mean to use fn:QName?`
		);
	}
	return sequenceFactory.singleton(
		createAtomicValue(new QName(prefix, namespaceURI, localName), ValueType.XSQNAME)
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'untypedAtomic',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSUNTYPEDATOMIC, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSUNTYPEDATOMIC
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSERROR,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSERROR
		) as FunctionDefinitionType,
	},
	// AnySimpleType cannot be instantiated
	// AnyAtomicType cannot be instantiated
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSSTRING
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'boolean',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSBOOLEAN
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'decimal',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDECIMAL, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDECIMAL
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'float',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSFLOAT, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSFLOAT
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'double',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDOUBLE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDOUBLE
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'duration',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDURATION, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDURATION
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTime',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDATETIME
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTimeStamp',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		// TODO: this seems like a bug not sure though: xs:datetime instead of xs:datetimestamp
		returnType: { type: ValueType.XSDATETIME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDATETIMESTAMP
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'time',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSTIME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSTIME
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'date',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDATE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDATE
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gYearMonth',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSGYEARMONTH, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSGYEARMONTH
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gYear',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSGYEAR, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSGYEAR
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gMonthDay',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSGMONTHDAY, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSGMONTHDAY
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gDay',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSGDAY, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSGDAY
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gMonth',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSGMONTH, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSGMONTH
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'hexBinary',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSHEXBINARY, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSHEXBINARY
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'base64Binary',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBASE64BINARY, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSBASE64BINARY
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'QName',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: xsQName,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'anyURI',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSANYURI, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSANYURI
		) as FunctionDefinitionType,
	},
	// NOTATION cannot be instantiated
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'normalizedString',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSNORMALIZEDSTRING,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNORMALIZEDSTRING
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'token',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSTOKEN, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSTOKEN
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'language',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSLANGUAGE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSLANGUAGE
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NMTOKEN',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSNMTOKEN, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNMTOKEN
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NMTOKENS',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSNMTOKENS, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNMTOKENS
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'Name',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNAME
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NCName',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSNCNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNCNAME
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ID',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSID, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSID
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'IDREF',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSIDREF, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSIDREF
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'IDREFS',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSIDREFS, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSIDREFS
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ENTITY',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSENTITY, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSENTITY
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ENTITIES',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSENTITIES, mult: SequenceMultiplicity.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSENTITIES
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'integer',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSINTEGER
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'nonPositiveInteger',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSNONPOSITIVEINTEGER,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNONPOSITIVEINTEGER
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'negativeInteger',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSNEGATIVEINTEGER,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNEGATIVEINTEGER
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'long',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSLONG, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSLONG
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'int',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSINT, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSINT
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'short',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSSHORT, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSSHORT
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'byte',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSBYTE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSBYTE
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'nonNegativeInteger',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSNONNEGATIVEINTEGER,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSNONNEGATIVEINTEGER
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedLong',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSUNSIGNEDLONG, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSUNSIGNEDLONG
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedInt',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSUNSIGNEDINT, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSUNSIGNEDINT
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedShort',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSUNSIGNEDSHORT, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSUNSIGNEDSHORT
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedByte',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSUNSIGNEDBYTE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSUNSIGNEDBYTE
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'positiveInteger',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSPOSITIVEINTEGER,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSPOSITIVEINTEGER
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'yearMonthDuration',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSYEARMONTHDURATION,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSYEARMONTHDURATION
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dayTimeDuration',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: {
			type: ValueType.XSDAYTIMEDURATION,
			mult: SequenceMultiplicity.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDAYTIMEDURATION
		) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTimeStamp',
		argumentTypes: [
			{ type: ValueType.XSANYATOMICTYPE, mult: SequenceMultiplicity.ZERO_OR_ONE },
		],
		returnType: { type: ValueType.XSDATETIMESTAMP, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(
			null,
			ValueType.XSDATETIMESTAMP
		) as FunctionDefinitionType,
	},
];

export default {
	declarations,
};
