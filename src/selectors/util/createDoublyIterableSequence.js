import Sequence from '../dataTypes/Sequence';

/**
 * @param   {!Sequence}  sequence
 * @return  {!function():!Sequence}
 */
export default function createDoublyIterableSequence (sequence) {
	const savedValues = [];
	const backingIterator = sequence.value();
	return function () {
		let i = 0;
		return new Sequence({
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
