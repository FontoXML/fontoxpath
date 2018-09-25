import Sequence from '../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

import { FUNCTIONS_NAMESPACE_URI } from '../staticallyKnownNamespaces';

import FunctionDefinitionType from './FunctionDefinitionType';

/**
 * @type {!FunctionDefinitionType}
 */
function fnNot (_dynamicContext, _executionParameters, _staticContext, sequence) {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value === false ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
	let done = false;
	return new Sequence({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const ebv = sequence.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				return notReady(ebv.promise);
			}
			done = true;
			return ready(ebv.value === false ? trueBoolean : falseBoolean);
		}
	});
}


/**
 * @type {!FunctionDefinitionType}
 */
function fnBoolean (_dynamicContext, _executionParameters, _staticContext, sequence) {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
	let done = false;
	return new Sequence({
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}
			const ebv = sequence.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				return notReady(ebv.promise);
			}
			done = true;
			return ready(ebv.value ? trueBoolean : falseBoolean);
		}
	});
}


/**
 * @type {!FunctionDefinitionType}
 */
function fnTrue () {
	return Sequence.singletonTrueSequence();
}


/**
 * @type {!FunctionDefinitionType}
 */
function fnFalse () {
	return Sequence.singletonFalseSequence();
}

export default {
	declarations: [
		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'boolean',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnBoolean
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'true',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnTrue
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'not',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnNot
		},

		{
			namespaceURI: FUNCTIONS_NAMESPACE_URI,
			localName: 'false',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnFalse
		}
	],
	functions: {
		boolean: fnBoolean,
		true: fnTrue,
		false: fnFalse,
		not: fnNot
	}
};
