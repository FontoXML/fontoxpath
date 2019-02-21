import createAtomicValue from '../dataTypes/createAtomicValue';
import FunctionValue from '../dataTypes/FunctionValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import zipSingleton from '../util/zipSingleton';
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
			value: functionProperties.callFunction
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
		return sequenceFactory.singleton(createAtomicValue(functionValue.getQName(), 'xs:QName'));
	});
};

const fnFunctionArity: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem
) => {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		return sequenceFactory.singleton(createAtomicValue(functionValue.getArity(), 'xs:integer'));
	});
};

export default {
	declarations: [
		{
			argumentTypes: ['xs:QName', 'xs:integer'],
			callFunction: fnFunctionLookup,
			localName: 'function-lookup',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'function(*)?'
		},

		{
			argumentTypes: ['function(*)'],
			callFunction: fnFunctionName,
			localName: 'function-name',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:QName?'
		},

		{
			argumentTypes: ['function(*)'],
			callFunction: fnFunctionArity,
			localName: 'function-arity',
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			returnType: 'xs:integer'
		}
	]
};
