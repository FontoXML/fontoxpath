import { atomizeSingleValue } from '../dataTypes/atomize';
import ISequence from '../dataTypes/ISequence';
import sequenceFactory from '../dataTypes/sequenceFactory';
import ExecutionParameters from '../ExecutionParameters';
import { DONE_TOKEN } from './iterators';

export default function atomizeSequence(
	sequence: ISequence,
	executionParameters: ExecutionParameters
): ISequence {
	let currentSequence: ISequence;

	return sequenceFactory.create({
		next: (iterationHint) => {
			while (true) {
				if (!currentSequence) {
					const value = sequence.value.next(iterationHint);
					if (value.done) {
						return DONE_TOKEN;
					}

					currentSequence = atomizeSingleValue(value.value, executionParameters);
				}
				const atomizedValue = currentSequence.value.next(iterationHint);
				if (atomizedValue.done) {
					currentSequence = null;
					continue;
				}

				return atomizedValue;
			}
		},
	});
}
