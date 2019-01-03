import SequenceFactory from '../dataTypes/SequenceFactory';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from './iterators';
import Value from '../dataTypes/Value';

/**
 * @param   {!ISequence}                                         sequence
 * @param   {!function(!Value):!ISequence}  typeTest
 * @return  {!ISequence}
 */
export default function sequenceEvery (sequence, typeTest) {
	const iterator = sequence.value;
	let typeTestResultIterator = null;
	let done;
	return SequenceFactory.create({
		next: () => {
			while (!done) {
				if (!typeTestResultIterator) {
					const value = iterator.next();
					if (!value.ready) {
						return value;
					}
					if (value.done) {
						done = true;
						return ready(trueBoolean);
					}
					typeTestResultIterator = typeTest(/** @type {!Value} */(value.value));
				}
				const ebv = typeTestResultIterator.tryGetEffectiveBooleanValue();
				if (!ebv.ready) {
					return notReady(ebv.promise);
				}
				typeTestResultIterator = null;
				if (ebv.value === false) {
					done = true;
					return ready(falseBoolean);
				}
			}
			return DONE_TOKEN;
		}
	});
}
