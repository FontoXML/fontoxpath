import SequenceFactory from '../dataTypes/SequenceFactory';
import ISequence from '../dataTypes/ISequence';
import { notReady } from './iterators';

import Value from '../dataTypes/Value';

type CallbackType = (values: Array<Value>) => ISequence;

export default function zipSingleton (sequences: Array<ISequence>, callback: CallbackType): ISequence {
	const firstValues = sequences.map(seq => seq.tryGetFirst());
	if (firstValues.every(val => val.ready)) {
		// Skip sequence if we can resolve immediately
		return callback(firstValues.map(seq => seq.value));
	}

	let iterator = null;
	return SequenceFactory.create({
		next: () => {
			if (iterator === null) {
				let allReady = true;
				for (let i = 0, l = firstValues.length; i < l; ++i) {
					if (firstValues[i].ready) {
						continue;
					}
					const val = firstValues[i] = sequences[i].tryGetFirst();
					if (!val.ready) {
						allReady = false;
						return notReady(val.promise);
					}
				}
				if (allReady) {
					iterator = callback(firstValues.map(seq => seq.value)).value;
				}
			}
			return iterator.next();
		}
	});
}
