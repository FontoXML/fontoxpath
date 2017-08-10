import Sequence from '../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';

function fnNot (_dynamicContext, sequence) {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value === false ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
	let done = false;
	return new Sequence({
		next: () => {
			if (done) {
				return { done: true, ready: true };
			}
			const ebv = sequence.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				return { done: false, ready: false, promise: ebv.promise };
			}
			done = true;
			return { done: false, ready: true, value: ebv.value === false ? trueBoolean : falseBoolean };
		}
	});
}

function fnBoolean (_dynamicContext, sequence) {
	const ebv = sequence.tryGetEffectiveBooleanValue();
	if (ebv.ready) {
		return ebv.value ? Sequence.singletonTrueSequence() : Sequence.singletonFalseSequence();
	}
	let done = false;
	return new Sequence({
		next: () => {
			if (done) {
				return { done: true, ready: true };
			}
			const ebv = sequence.tryGetEffectiveBooleanValue();
			if (!ebv.ready) {
				return { done: false, ready: false, promise: ebv.promise };
			}
			done = true;
			return { done: false, ready: true, value: ebv.value ? trueBoolean : falseBoolean };
		}
	});
}

function fnTrue () {
	return Sequence.singletonTrueSequence();
}

function fnFalse () {
	return Sequence.singletonFalseSequence();
}

export default {
	declarations: [
		{
			name: 'boolean',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnBoolean
		},

		{
			name: 'true',
			argumentTypes: [],
			returnType: 'xs:boolean',
			callFunction: fnTrue
		},

		{
			name: 'not',
			argumentTypes: ['item()*'],
			returnType: 'xs:boolean',
			callFunction: fnNot
		},

		{
			name: 'false',
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
