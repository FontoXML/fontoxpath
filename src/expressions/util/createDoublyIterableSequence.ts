import SequenceFactory from '../dataTypes/SequenceFactory';

export default function createDoublyIterableSequence(sequence) {
	const savedValues = [];
	const backingIterator = sequence.value;
	return function() {
		let i = 0;
		return SequenceFactory.create({
			next: () => {
				if (savedValues[i] !== undefined) {
					return savedValues[i++];
				}
				const val = backingIterator.next();
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
