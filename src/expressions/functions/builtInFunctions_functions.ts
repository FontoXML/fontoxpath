import { BaseType } from '../dataTypes/BaseType';
import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import zipSingleton from '../util/zipSingleton';
import { BuiltinDeclarationType } from './builtInFunctions';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnFunctionLookup: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	staticContext,
	nameSequence,
	aritySequence
) => {
	return zipSingleton([nameSequence, aritySequence], ([name, arity]) => {
		const functionProperties = staticContext.lookupFunction(
			name.value.namespaceURI,
			name.value.localName,
			arity.value
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
	functionItem
) => {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		if (functionValue.isAnonymous()) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(
			createAtomicValue(functionValue.getQName(), {
				kind: BaseType.XSQNAME,
				seqType: SequenceType.EXACTLY_ONE,
			})
		);
	});
};

const fnFunctionArity: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem
) => {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		return sequenceFactory.singleton(
			createAtomicValue(functionValue.getArity(), {
				kind: BaseType.XSINTEGER,
				seqType: SequenceType.EXACTLY_ONE,
			})
		);
	});
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [
			{ kind: BaseType.XSQNAME, seqType: SequenceType.EXACTLY_ONE },
			{ kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
		],
		callFunction: fnFunctionLookup,
		localName: 'function-lookup',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: {
			seqType: SequenceType.ZERO_OR_ONE,
			kind: BaseType.FUNCTION,
			returnType: undefined,
			params: [],
		},
	},

	{
		argumentTypes: [
			{
				kind: BaseType.FUNCTION,
				returnType: undefined,
				params: [],
				seqType: SequenceType.EXACTLY_ONE,
			},
		],
		callFunction: fnFunctionName,
		localName: 'function-name',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSQNAME, seqType: SequenceType.ZERO_OR_ONE },
	},

	{
		argumentTypes: [
			{
				kind: BaseType.FUNCTION,
				returnType: undefined,
				params: [],
				seqType: SequenceType.EXACTLY_ONE,
			},
		],
		callFunction: fnFunctionArity,
		localName: 'function-arity',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSINTEGER, seqType: SequenceType.EXACTLY_ONE },
	},
];

export default {
	declarations,
};
