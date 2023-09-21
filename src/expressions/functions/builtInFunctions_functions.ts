import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { BUILT_IN_NAMESPACE_URIS } from '../staticallyKnownNamespaces';
import zipSingleton from '../util/zipSingleton';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnFunctionLookup: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	staticContext,
	nameSequence,
	aritySequence,
) => {
	return zipSingleton([nameSequence, aritySequence], ([name, arity]) => {
		const functionProperties = staticContext.lookupFunction(
			name.value.namespaceURI,
			name.value.localName,
			arity.value,
		);

		if (functionProperties === null) {
			return sequenceFactory.empty();
		}

		const functionItem = new FunctionValue({
			argumentTypes: functionProperties.argumentTypes,
			arity: arity.value,
			localName: name.value.localName,
			namespaceURI: name.value.namespaceURI,
			returnType: functionProperties.returnType,
			value: functionProperties.callFunction,
		});

		return sequenceFactory.singleton(functionItem);
	});
};

const fnFunctionName: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem,
) => {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		if (functionValue.isAnonymous()) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(
			createAtomicValue(functionValue.getQName(), ValueType.XSQNAME),
		);
	});
};

const fnFunctionArity: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem,
) => {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		return sequenceFactory.singleton(
			createAtomicValue(functionValue.getArity(), ValueType.XSINTEGER),
		);
	});
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [
			{ type: ValueType.XSQNAME, mult: SequenceMultiplicity.EXACTLY_ONE },
			{ type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
		],
		callFunction: fnFunctionLookup,
		localName: 'function-lookup',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: {
			mult: SequenceMultiplicity.ZERO_OR_ONE,
			type: ValueType.FUNCTION,
		},
	},

	{
		argumentTypes: [
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnFunctionName,
		localName: 'function-name',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSQNAME, mult: SequenceMultiplicity.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{
				type: ValueType.FUNCTION,
				mult: SequenceMultiplicity.EXACTLY_ONE,
			},
		],
		callFunction: fnFunctionArity,
		localName: 'function-arity',
		namespaceURI: BUILT_IN_NAMESPACE_URIS.FUNCTIONS_NAMESPACE_URI,
		returnType: { type: ValueType.XSINTEGER, mult: SequenceMultiplicity.EXACTLY_ONE },
	},
];

export default {
	declarations,
};
