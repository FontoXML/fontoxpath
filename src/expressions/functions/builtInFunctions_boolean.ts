import { falseBoolean, trueBoolean } from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';
const fnNot: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	const ebv = sequence.getEffectiveBooleanValue();
	return ebv === false
		? sequenceFactory.singletonTrueSequence()
		: sequenceFactory.singletonFalseSequence();
};

const fnBoolean: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	const ebv = sequence.getEffectiveBooleanValue();
	return ebv ? sequenceFactory.singletonTrueSequence() : sequenceFactory.singletonFalseSequence();
};

const fnTrue: FunctionDefinitionType = () => {
	return sequenceFactory.singletonTrueSequence();
};

const fnFalse: FunctionDefinitionType = () => {
	return sequenceFactory.singletonFalseSequence();
};

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'boolean',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnBoolean,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'true',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnTrue,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'not',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnNot,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'false',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnFalse,
		},
	],
	functions: {
		boolean: fnBoolean,
		true: fnTrue,
		false: fnFalse,
		not: fnNot,
	},
};
