import { DONE_TOKEN, IAsyncIterator, ready } from './iterators';

export default function createSingleValueIterator<T>(onlyValue: T): IAsyncIterator<T> {
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
