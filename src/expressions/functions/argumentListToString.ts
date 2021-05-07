import ISequence from '../dataTypes/ISequence';
import { sequenceTypeToString } from '../dataTypes/Value';

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
				return sequenceTypeToString(argument.first().type) || 'item()';
			}
			return sequenceTypeToString(argument.first().type) + '+';
		})
		.map((types) => `${types}`)
		.join(', ');
}
