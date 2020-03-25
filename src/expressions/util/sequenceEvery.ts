import { falseBoolean, trueBoolean } from '../dataTypes/createAtomicValue';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import { DONE_TOKEN, IterationHint, notReady, ready } from './iterators';

export default function sequenceEvery(
	sequence: ISequence,
	typeTest: (value: Value) => ISequence
): ISequence {
	const iterator = sequence.value;
	let typeTestResultIterator: ISequence | null = null;
	let done = false;
	return sequenceFactory.create({
		next: (_hint: IterationHint) => {
			while (!done) {
				if (!typeTestResultIterator) {
					const value = iterator.next(IterationHint.NONE);
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
		},
	});
}
