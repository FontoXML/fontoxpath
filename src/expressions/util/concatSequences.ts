import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN } from './iterators';

export default function concatSequences(sequences: ISequence[]): ISequence {
	let i = 0;
	let iterator = null;
	return sequenceFactory.create({
		next: () => {
			while (i < sequences.length) {
				if (!iterator) {
					iterator = sequences[i].value;
				}
				const value = iterator.next();
				if (value.done) {
					i++;
					iterator = null;
					continue;
				}
				return value;
			}
			return DONE_TOKEN;
		}
	});
}
