import { falseBoolean, trueBoolean } from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import SequenceFactory from '../dataTypes/SequenceFactory';
import { DONE_TOKEN, notReady, ready } from './iterators';

export default function sequenceEvery(
	sequence: ISequence,
	typeTest: (Value) => ISequence
): ISequence {
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
