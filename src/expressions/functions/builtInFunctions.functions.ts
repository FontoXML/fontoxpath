import createAtomicValue from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import zipSingleton from '../util/zipSingleton';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
import FunctionValue from '../dataTypes/FunctionValue';
import FunctionDefinitionType from './FunctionDefinitionType';

const fnFunctionLookup: FunctionDefinitionType = function(
	_dynamicContext,
	executionParameters,
	staticContext,
	nameSequence,
	aritySequence
) {
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

const fnFunctionName: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem
) {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		if (functionValue.isAnonymous()) {
			return sequenceFactory.empty();
		}
		return sequenceFactory.singleton(createAtomicValue(functionValue.getQName(), 'xs:QName'));
	});
};

const fnFunctionArity: FunctionDefinitionType = function(
	_dynamicContext,
	_executionParameters,
	_staticContext,
	functionItem
) {
	return zipSingleton([functionItem], ([functionValue]: FunctionValue[]) => {
		return sequenceFactory.singleton(createAtomicValue(functionValue.getArity(), 'xs:integer'));
	});
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'function-lookup',
			argumentTypes: ['xs:QName', 'xs:integer'],
			returnType: 'function(*)?',
			callFunction: fnFunctionLookup
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'function-name',
			argumentTypes: ['function(*)'],
			returnType: 'xs:QName?',
			callFunction: fnFunctionName
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'function-arity',
			argumentTypes: ['function(*)'],
			returnType: 'xs:integer',
			callFunction: fnFunctionArity
		}
	]
};
