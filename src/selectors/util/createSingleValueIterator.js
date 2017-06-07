export default function createSingleValueIterator (onlyValue) {
	let hasPassed = false;
	return {
		next: () => {
			if (hasPassed) {
				return { done: true };
			}
			hasPassed = true;
			return { done: false, value: onlyValue };
		}
	};
}
