import { DONE_TOKEN, IIterator, ready } from './iterators';

export default function createSingleValueIterator<T>(onlyValue: T): IIterator<T> {
	let hasPassed = false;
	return {
		next: () => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			hasPassed = true;
			return ready(onlyValue);
		},
	};
}
