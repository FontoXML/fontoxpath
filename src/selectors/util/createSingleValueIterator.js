export default function createSingleValueIterator (onlyValue) {
	let hasPassed = false;
	return {
		next: () => {
			if (hasPassed) {
				return { done: true, ready: true, value: undefined };
			}
			hasPassed = true;
			return { done: false, ready: true, value: onlyValue };
		}
	};
}
