import castToType from '../dataTypes/castToType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { normalizeWhitespace, validatePattern } from '../dataTypes/typeHelpers';
import { BaseType } from '../dataTypes/Value';
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
	if (
		isSubtypeOf(value.type, {
			kind: BaseType.XSNUMERIC,
		})
	) {
		// This won't ever work
		throw new Error('XPTY0004: The provided QName is not a string-like value.');
	}
	let lexicalQName = castToType(value, {
		kind: BaseType.XSSTRING,
	}).value;
	// Test lexical scope
	lexicalQName = normalizeWhitespace(lexicalQName, {
		kind: BaseType.XSQNAME,
	});
	if (
		!validatePattern(lexicalQName, {
			kind: BaseType.XSQNAME,
		})
	) {
		throw new Error('FORG0001: The provided QName is invalid.');
	}
	if (!lexicalQName.includes(':')) {
		// Only a local part
		const resolvedDefaultNamespaceURI = staticContext.resolveNamespace('');
		return sequenceFactory.singleton(
			createAtomicValue(new QName('', resolvedDefaultNamespaceURI, lexicalQName), {
				kind: BaseType.XSQNAME,
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
		createAtomicValue(new QName(prefix, namespaceURI, localName), { kind: BaseType.XSQNAME })
	);
};

export default {
	declarations: [
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'untypedAtomic',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSUNTYPEDATOMIC } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSUNTYPEDATOMIC,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'error',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: {
				kind: BaseType.NULLABLE,
				item: { kind: BaseType.XSERROR },
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
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSSTRING } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSSTRING,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'boolean',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSBOOLEAN } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSBOOLEAN,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'decimal',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDECIMAL } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDECIMAL,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'float',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSFLOAT } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSFLOAT,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'double',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDOUBLE } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDOUBLE,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'duration',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDURATION } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDURATION,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTime',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDATETIME } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDATETIME,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			// TODO: this seems like a bug not sure though: xs:datetime instead of xs:datetimestamp
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDATETIME } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDATETIMESTAMP,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'time',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSTIME } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSTIME,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'date',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDATE } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDATE,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYearMonth',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSGYEARMONTH } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSGYEARMONTH,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gYear',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSGYEAR } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSGYEAR,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonthDay',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSGMONTHDAY } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSGMONTHDAY,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gDay',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSGDAY } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSGDAY,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'gMonth',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSGMONTH } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSGMONTH,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'hexBinary',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSHEXBINARY } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSHEXBINARY,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'base64Binary',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSBASE64BINARY } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSBASE64BINARY,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'QName',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSQNAME } },
			callFunction: xsQName,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'anyURI',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYURI } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSANYURI,
			}) as FunctionDefinitionType,
		},
		// NOTATION cannot be instantiated
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'normalizedString',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNORMALIZEDSTRING } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNORMALIZEDSTRING,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'token',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSTOKEN } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSTOKEN,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'language',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSLANGUAGE } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSLANGUAGE,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKEN',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNMTOKEN } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNMTOKEN,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NMTOKENS',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.ANY, item: { kind: BaseType.XSNMTOKENS } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNMTOKENS,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'Name',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNAME } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNAME,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'NCName',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNCNAME } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNCNAME,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ID',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSID } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSID,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREF',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSIDREF } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSIDREF,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'IDREFS',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.ANY, item: { kind: BaseType.XSIDREFS } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSIDREFS,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITY',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSENTITY } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSENTITY,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'ENTITIES',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.ANY, item: { kind: BaseType.XSENTITIES } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSENTITIES,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'integer',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSINTEGER } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSINTEGER,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonPositiveInteger',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNONPOSITIVEINTEGER } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNONPOSITIVEINTEGER,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'negativeInteger',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNEGATIVEINTEGER } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNEGATIVEINTEGER,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'long',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSLONG } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSLONG,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'int',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSINT } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSINT,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'short',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSSHORT } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSSHORT,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'byte',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSBYTE } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSBYTE,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'nonNegativeInteger',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSNONNEGATIVEINTEGER } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSNONNEGATIVEINTEGER,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedLong',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSUNSIGNEDLONG } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSUNSIGNEDLONG,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedInt',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSUNSIGNEDINT } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSUNSIGNEDINT,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedShort',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSUNSIGNEDSHORT } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSUNSIGNEDSHORT,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'unsignedByte',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSUNSIGNEDBYTE } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSUNSIGNEDBYTE,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'positiveInteger',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSPOSITIVEINTEGER } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSPOSITIVEINTEGER,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'yearMonthDuration',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSYEARMONTHDURATION } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSYEARMONTHDURATION,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dayTimeDuration',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDAYTIMEDURATION } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDAYTIMEDURATION,
			}) as FunctionDefinitionType,
		},
		{
			namespaceURI: XMLSCHEMA_NAMESPACE_URI,
			localName: 'dateTimeStamp',
			argumentTypes: [{ kind: BaseType.NULLABLE, item: { kind: BaseType.XSANYATOMICTYPE } }],
			returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.XSDATETIMESTAMP } },
			callFunction: genericDataTypeConstructor.bind(null, {
				kind: BaseType.XSDATETIMESTAMP,
			}) as FunctionDefinitionType,
		},
	],
};
