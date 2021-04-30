import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { BaseType } from '../dataTypes/Value';
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
			createAtomicValue(functionValue.getQName(), { kind: BaseType.XSQNAME })
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
			createAtomicValue(functionValue.getArity(), { kind: BaseType.XSINTEGER })
		);
	});
};

const declarations: BuiltinDeclarationType[] = [
	{
		argumentTypes: [{ kind: BaseType.XSQNAME }, { kind: BaseType.XSINTEGER }],
		callFunction: fnFunctionLookup,
		localName: 'function-lookup',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.NULLABLE, item: { kind: BaseType.FUNCTION, returnType: undefined, params: [] } },
	},

	{
		argumentTypes: [{ kind: BaseType.FUNCTION, returnType: undefined, params: [] }],
		callFunction: fnFunctionName,
		localName: 'function-name',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: {kind: BaseType.NULLABLE, item: { kind: BaseType.XSQNAME }},
	},

	{
		argumentTypes: [{ kind: BaseType.FUNCTION, returnType: undefined, params: [] }],
		callFunction: fnFunctionArity,
		localName: 'function-arity',
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		returnType: { kind: BaseType.XSINTEGER },
	},
];

export default {
	declarations,
};
