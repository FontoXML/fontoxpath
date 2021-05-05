import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { normalizeWhitespace, validatePattern } from '../dataTypes/typeHelpers';
import { BaseType, SequenceType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';

import { XMLSCHEMA_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import { BuiltinDeclarationType } from './builtInFunctions';

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
	if (isSubtypeOf(value.type.kind, BaseType.XSNUMERIC)) {
		// This won't ever work
		throw new Error('XPTY0004: The provided QName is not a string-like value.');
	}
	let lexicalQName = castToType(value, {
		kind: BaseType.XSSTRING,
		seqType: SequenceType.EXACTLY_ONE,
	}).value;
	// Test lexical scope
	lexicalQName = normalizeWhitespace(lexicalQName, BaseType.XSQNAME);
	if (!validatePattern(lexicalQName, BaseType.XSQNAME)) {
		throw new Error('FORG0001: The provided QName is invalid.');
	}
	if (!lexicalQName.includes(':')) {
		// Only a local part
		const resolvedDefaultNamespaceURI = staticContext.resolveNamespace('');
		return sequenceFactory.singleton(
			createAtomicValue(new QName('', resolvedDefaultNamespaceURI, lexicalQName), {
				kind: BaseType.XSQNAME,
				seqType: SequenceType.EXACTLY_ONE,
			})
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
		createAtomicValue(new QName(prefix, namespaceURI, localName), {
			kind: BaseType.XSQNAME,
			seqType: SequenceType.EXACTLY_ONE,
		})
	);
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'untypedAtomic',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSUNTYPEDATOMIC, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSUNTYPEDATOMIC,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'error',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: {
			kind: BaseType.XSERROR,
			seqType: SequenceType.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSERROR,
		}) as FunctionDefinitionType,
	},
	// AnySimpleType cannot be instantiated
	// AnyAtomicType cannot be instantiated
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'string',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSTRING, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSSTRING,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'boolean',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSBOOLEAN,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'decimal',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDECIMAL, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDECIMAL,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'float',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSFLOAT, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSFLOAT,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'double',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDOUBLE, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDOUBLE,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'duration',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDURATION, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDURATION,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTime',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDATETIME,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTimeStamp',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		// TODO: this seems like a bug not sure though: xs:datetime instead of xs:datetimestamp
		returnType: { kind: BaseType.XSDATETIME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDATETIMESTAMP,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'time',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSTIME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSTIME,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'date',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDATE, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDATE,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gYearMonth',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSGYEARMONTH, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSGYEARMONTH,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gYear',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSGYEAR, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSGYEAR,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gMonthDay',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSGMONTHDAY, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSGMONTHDAY,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gDay',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSGDAY, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSGDAY,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'gMonth',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSGMONTH, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSGMONTH,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'hexBinary',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSHEXBINARY, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSHEXBINARY,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'base64Binary',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSBASE64BINARY, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSBASE64BINARY,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'QName',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSQNAME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: xsQName,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'anyURI',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSANYURI, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSANYURI,
		}) as FunctionDefinitionType,
	},
	// NOTATION cannot be instantiated
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'normalizedString',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNORMALIZEDSTRING, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNORMALIZEDSTRING,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'token',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSTOKEN, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSTOKEN,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'language',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSLANGUAGE, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSLANGUAGE,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NMTOKEN',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNMTOKEN, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNMTOKEN,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NMTOKENS',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNMTOKENS, seqType: SequenceType.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNMTOKENS,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'Name',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNAME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNAME,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'NCName',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNCNAME, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNCNAME,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ID',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSID, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSID,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'IDREF',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSIDREF, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSIDREF,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'IDREFS',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSIDREFS, seqType: SequenceType.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSIDREFS,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ENTITY',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSENTITY, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSENTITY,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'ENTITIES',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSENTITIES, seqType: SequenceType.ZERO_OR_MORE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSENTITIES,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'integer',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSINTEGER,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'nonPositiveInteger',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: {
			kind: BaseType.XSNONPOSITIVEINTEGER,
			seqType: SequenceType.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNONPOSITIVEINTEGER,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'negativeInteger',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSNEGATIVEINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNEGATIVEINTEGER,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'long',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSLONG, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSLONG,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'int',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSINT, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSINT,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'short',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSSHORT, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSSHORT,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'byte',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSBYTE, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSBYTE,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'nonNegativeInteger',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: {
			kind: BaseType.XSNONNEGATIVEINTEGER,
			seqType: SequenceType.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSNONNEGATIVEINTEGER,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedLong',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSUNSIGNEDLONG, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSUNSIGNEDLONG,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedInt',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSUNSIGNEDINT, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSUNSIGNEDINT,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedShort',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSUNSIGNEDSHORT, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSUNSIGNEDSHORT,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'unsignedByte',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSUNSIGNEDBYTE, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSUNSIGNEDBYTE,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'positiveInteger',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSPOSITIVEINTEGER, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSPOSITIVEINTEGER,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'yearMonthDuration',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: {
			kind: BaseType.XSYEARMONTHDURATION,
			seqType: SequenceType.ZERO_OR_ONE,
		},
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSYEARMONTHDURATION,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dayTimeDuration',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDAYTIMEDURATION, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDAYTIMEDURATION,
		}) as FunctionDefinitionType,
	},
	{
		namespaceURI: XMLSCHEMA_NAMESPACE_URI,
		localName: 'dateTimeStamp',
		argumentTypes: [{ kind: BaseType.XSANYATOMICTYPE, seqType: SequenceType.ZERO_OR_ONE }],
		returnType: { kind: BaseType.XSDATETIMESTAMP, seqType: SequenceType.ZERO_OR_ONE },
		callFunction: genericDataTypeConstructor.bind(null, {
			kind: BaseType.XSDATETIMESTAMP,
		}) as FunctionDefinitionType,
	},
];

export default {
	declarations,
};
