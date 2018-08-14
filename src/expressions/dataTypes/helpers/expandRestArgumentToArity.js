export default function expandRestArgumentToArity (argumentTypes, arity) {
	const indexOfRest = argumentTypes.indexOf('...');
	if (indexOfRest > -1) {
		const replacePart = new Array(arity - (argumentTypes.length - 1))
			.fill(argumentTypes[indexOfRest - 1]);

		return argumentTypes.slice(0, indexOfRest)
			.concat(replacePart);
	}
	return argumentTypes;
}
