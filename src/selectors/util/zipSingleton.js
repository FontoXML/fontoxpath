import Sequence from '../dataTypes/Sequence';

export default function zipSingleton (sequences, callback) {
	const firstValues = sequences.map(seq => seq.tryGetFirst());
	if (firstValues.every(val => val.ready)) {
		// Skip sequence if we can resolve immediately
		return callback(firstValues.map(seq => seq.value));
	}

	let iterator = null;
	return new Sequence({
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
						return { done: false, ready: false, promise: val.promise };
					}
				}
				if (allReady) {
					iterator = callback(firstValues.map(seq => seq.value)).value();
				}
			}
			return iterator.next();
		}
	});
}
