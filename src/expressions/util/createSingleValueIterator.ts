import { AsyncIterator, DONE_TOKEN, ready } from './iterators';

export default function createSingleValueIterator<T>(onlyValue: T): AsyncIterator<T> {
	let hasPassed = false;
	return {
		next: () => {
			if (hasPassed) {
				return DONE_TOKEN;
			}
			hasPassed = true;
			return ready(onlyValue);
		}
	};
}
