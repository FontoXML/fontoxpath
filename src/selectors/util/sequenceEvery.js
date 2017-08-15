import Sequence from '../dataTypes/Sequence';
import { trueBoolean, falseBoolean } from '../dataTypes/createAtomicValue';
import { DONE_TOKEN, notReady, ready } from './iterators';
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
						return ready(trueBoolean);
					}
					typeTestResultIterator = typeTest(value.value);
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
