import { falseBoolean, trueBoolean } from '../dataTypes/createAtomicValue';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';
const fnNot: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value === false
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}
	let done = false;
	return sequenceFactory.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const ebvAttempt = sequence.tryGetEffectiveBooleanValue();
			if (!ebvAttempt.ready) {
				return notReady(ebvAttempt.promise);
			}
			done = true;
			return ready(ebvAttempt.value === false ? trueBoolean : falseBoolean);
		},
	});
};

const fnBoolean: FunctionDefinitionType = (
	_dynamicContext,
	_executionParameters,
	_staticContext,
	sequence
) => {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value
			? sequenceFactory.singletonTrueSequence()
			: sequenceFactory.singletonFalseSequence();
	}
	let done = false;
	return sequenceFactory.create({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const ebvAttempt = sequence.tryGetEffectiveBooleanValue();
			if (!ebvAttempt.ready) {
				return notReady(ebvAttempt.promise);
			}
			done = true;
			return ready(ebvAttempt.value ? trueBoolean : falseBoolean);
		},
	});
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
