import Sequence from '../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';

/**
 * @param   {!Sequence}                                         sequence
 * @param   {!function(!../dataTypes/Value):!Sequence}  typeTest
 * @return  {!Sequence}
 */
export default function sequenceEvery (sequence, typeTest) {
	const iterator = sequence.value();
	let typeTestResultIterator = null;
	let done;
	return new Sequence({
		next: () => {
			while (!done) {
				if (!typeTestResultIterator) {
					const value = iterator.next();
					if (!value.ready) {
						return value;
					}
					if (value.done) {
						done = true;
						return { done: false, ready: true, value: trueBoolean };
					}
					typeTestResultIterator = typeTest(value.value);
				}
				const ebv = typeTestResultIterator.tryGetEffectiveBooleanValue();
				if (!ebv.ready) {
					return { done: false, ready: false, promise: ebv.promise };
				}
				typeTestResultIterator = null;
				if (ebv.value === false) {
					done = true;
					return { done: false, ready: true, value: falseBoolean };
				}
			}
			return { done: true, ready: true };
		}
	});
}
