import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { IterationHint } from './iterators';

export default function createDoublyIterableSequence(sequence: ISequence): () => ISequence {
	const savedValues = [];
	const backingIterator = sequence.value;
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
