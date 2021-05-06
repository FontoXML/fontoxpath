import sequenceFactory from '../dataTypes/sequenceFactory';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';
import { BuiltinDeclarationType } from './builtInFunctions';
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

const declarations: BuiltinDeclarationType[] = [
	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'boolean',
		argumentTypes: [{ kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE }],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnBoolean,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'true',
		argumentTypes: [],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnTrue,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'not',
		argumentTypes: [{ kind: BaseType.ITEM, seqType: SequenceType.ZERO_OR_MORE }],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnNot,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'false',
		argumentTypes: [],
		returnType: { kind: BaseType.XSBOOLEAN, seqType: SequenceType.EXACTLY_ONE },
		callFunction: fnFalse,
	},
];

export default {
	declarations,
	functions: {
		boolean: fnBoolean,
		true: fnTrue,
		false: fnFalse,
		not: fnNot,
	},
};
