import Sequence from '../dataTypes/Sequence';

export default function concatSequences (sequences) {
	let i = 0;
	let iterator = null;
	return new Sequence({
		next: () => {
			while (i < sequences.length) {
				if (!iterator) {
					iterator = sequences[i].value();
				}
				const value = iterator.next();
				if (value.done) {
					i++;
					iterator = null;
					continue;
				}
				return value;
			}
			return { done: true, ready: true, value: undefined };
		}
	});
}
