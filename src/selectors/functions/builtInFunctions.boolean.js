import Sequence from '../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from '../util/iterators';

/**
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnNot (_dynamicContext, sequence) {
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
 * @param   {../DynamicContext}  _dynamicContext
 * @param   {Sequence}           sequence
 * @return  {Sequence}
 */
function fnBoolean (_dynamicContext, sequence) {
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
 * @return  {Sequence}
 */
function fnTrue () {
	return Sequence.singletonTrueSequence();
}

/**
 * @return  {Sequence}
 */
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
