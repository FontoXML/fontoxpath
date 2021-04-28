import ISequence from '../dataTypes/ISequence';

export default function argumentListToString(argumentList: ISequence[]) {
	return argumentList
		.map((argument) => {
			if (argument === null) {
				return 'placeholder';
			}
			if (argument.isEmpty()) {
				return 'item()?';
			}

			if (argument.isSingleton()) {
				return argument.first().type || 'item()';
			}
			return argument.first().type + '+';
		})
		.map((types) => `${types}`)
		.join(', ');
}
