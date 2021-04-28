import ISequence from '../dataTypes/ISequence';
import Value from '../dataTypes/Value';

type CallbackType = (values: Value[]) => ISequence;

/**
 * Take a bunch of sequences, take their first values and call the callback with those values
 */
export default function zipSingleton(sequences: ISequence[], callback: CallbackType): ISequence {
	const firstValues = sequences.map((seq) => seq.first());
	return callback(firstValues);
}
