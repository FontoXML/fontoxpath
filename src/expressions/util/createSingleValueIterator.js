import { DONE_TOKEN, ready } from './iterators';
export default function createSingleValueIterator (onlyValue) {
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
