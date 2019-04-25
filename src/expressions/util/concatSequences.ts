import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { DONE_TOKEN, IterationHint } from './iterators';

export default function concatSequences(sequences: ISequence[]): ISequence {
	let i = 0;
	let iterator = null;
	let isFirst = true;
	return sequenceFactory.create({
		next: (hint: IterationHint) => {
			while (i < sequences.length) {
				if (!iterator) {
					iterator = sequences[i].value;
					isFirst = true;
				}
				const value = iterator.next(isFirst ? IterationHint.NONE : hint);
				isFirst = false;
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
