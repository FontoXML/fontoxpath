import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceMultiplicity, ValueType } from '../dataTypes/Value';
import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';
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
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnBoolean,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'true',
		argumentTypes: [],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnTrue,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'not',
		argumentTypes: [{ type: ValueType.ITEM, mult: SequenceMultiplicity.ZERO_OR_MORE }],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
		callFunction: fnNot,
	},

	{
		namespaceURI: FUNCTIONS_NAMESPACE_URI,
		localName: 'false',
		argumentTypes: [],
		returnType: { type: ValueType.XSBOOLEAN, mult: SequenceMultiplicity.EXACTLY_ONE },
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
