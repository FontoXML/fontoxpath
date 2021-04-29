import sequenceFactory from '../dataTypes/sequenceFactory';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';
import { BaseType } from '../dataTypes/Value';
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
			argumentTypes: [{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } }],
			returnType: { kind: BaseType.XSBOOLEAN },
			callFunction: fnBoolean,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'true',
			argumentTypes: [],
			returnType: { kind: BaseType.XSBOOLEAN },
			callFunction: fnTrue,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'not',
			argumentTypes: [{ kind: BaseType.ANY, item: { kind: BaseType.ITEM } }],
			returnType: { kind: BaseType.XSBOOLEAN },
			callFunction: fnNot,
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'false',
			argumentTypes: [],
			returnType: { kind: BaseType.XSBOOLEAN },
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
