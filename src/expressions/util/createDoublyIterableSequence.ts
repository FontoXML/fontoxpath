import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value from '../dataTypes/Value';
import { IterationHint, IterationResult } from './iterators';

export default function createDoublyIterableSequence(sequence: ISequence): () => ISequence {
	if (sequence.canBeSafelyAdvanced) {
		return () => sequence;
	}
	const savedValues: IterationResult<Value>[] = [];
	const backingIterator = sequence.value;
	const allValues = sequence.tryGetAllValues();
	if (allValues.ready) {
		const arraySequence = sequenceFactory.create(allValues.value);
		return () => arraySequence;
	}
	return () => {
		let i = 0;
		return sequenceFactory.create({
			next: (_hint: IterationHint) => {
				if (savedValues[i] !== undefined) {
					return savedValues[i++];
				}
				const val = backingIterator.next(IterationHint.NONE);
				if (!val.ready) {
					return val;
				}
				if (val.done) {
					return val;
				}
				savedValues[i++] = val;
				return val;
			}
		});
	};
}
