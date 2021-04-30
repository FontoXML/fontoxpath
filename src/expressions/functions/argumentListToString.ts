import ISequence from '../dataTypes/ISequence';
import { valueTypeToString } from '../dataTypes/Value';

export default function argumentListToString(argumentList: ISequence[]) {
	return (
		argumentList
			.map((argument) => {
				if (argument === null) {
					return 'placeholder';
				}
				if (argument.isEmpty()) {
					return 'item()?';
				}

				if (argument.isSingleton()) {
					return valueTypeToString(argument.first().type) || 'item()';
				}
				return valueTypeToString(argument.first().type) + '+';
			})
			.map((types) => `${types}`)
			.join(', ')
	);
}
