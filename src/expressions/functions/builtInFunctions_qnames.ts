import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { validatePattern } from '../dataTypes/typeHelpers';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import QName from '../dataTypes/valueTypes/QName';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import zipSingleton from '../util/zipSingleton';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnQName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	paramURI,
	paramQName
) => {
	return zipSingleton([paramURI, paramQName], ([uriValue, lexicalQNameValue]) => {
		const lexicalQName = lexicalQNameValue.value;
		if (!validatePattern(lexicalQName, ValueType.XSQNAME)) {
			throw new Error('FOCA0002: The provided QName is invalid.');
		}
		const uri = uriValue ? uriValue.value || null : null;
		if (uri === null && lexicalQName.includes(':')) {
			throw new Error(
				'FOCA0002: The URI of a QName may not be empty if a prefix is provided.'
			);
		}
		// Skip URI validation for now

		if (paramURI.isEmpty()) {
			return sequenceFactory.singleton(
				createAtomicValue(new QName('', null, lexicalQName), ValueType.XSQNAME)
			);
		}
		if (!lexicalQName.includes(':')) {
			// Only a local part
			return sequenceFactory.singleton(
				createAtomicValue(new QName('', uri, lexicalQName), ValueType.XSQNAME)
			);
		}
		const [prefix, localName] = lexicalQName.split(':');
		return sequenceFactory.singleton(
			createAtomicValue(new QName(prefix, uri, localName), ValueType.XSQNAME)
		);
	});
};

const fnPrefixFromQName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	return zipSingleton([arg], ([qname]) => {
		if (qname === null) {
			return sequenceFactory.empty();
		}
		const qnameValue = qname.value;
		if (!qnameValue.prefix) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(createAtomicValue(qnameValue.prefix, ValueType.XSNCNAME));
	});
};

const fnNamespaceURIFromQName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	return arg.map((qname) => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.namespaceURI || '', ValueType.XSANYURI);
	});
};

const fnLocalNameFromQName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	arg
) => {
	return arg.map((qname) => {
		const qnameValue = qname.value;
		return createAtomicValue(qnameValue.localName, ValueType.XSNCNAME);
	});
};

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'QName',
		argumentTypes: [
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.ZERO_OR_ONE },
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		returnType: { type: ValueType.XSQNAME, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnQName,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'prefix-from-QName',
		argumentTypes: [{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNCNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnPrefixFromQName,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'local-name-from-QName',
		argumentTypes: [{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSNCNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnLocalNameFromQName,
	},
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'namespace-uri-from-QName',
		argumentTypes: [{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE }],
		returnType: { type: ValueType.XSANYURI, mult: SequenceMultiplicity.ZERO_OR_ONE },
		callFunction: fnNamespaceURIFromQName,
	},
];

export default {
	declarations,
};
