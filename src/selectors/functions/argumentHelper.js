import { castToType, promoteToType } from '../dataTypes/conversionHelper';
import Sequence from '../dataTypes/Sequence';

function splitType (type) {
	// argumentType is something like 'xs:string?' or 'map(*)'
	var parts = type.match(/^(.*[^+?*])([\+\*\?])?$/);
	return {
		type: parts[1],
		multiplicity: parts[2]
	};
}
/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 * @param   {string}     argumentType
 * @param   {!Sequence}  argument
 * @return  {?Sequence}
 */
export const transformArgument = (argumentType, argument) => {
	const { type, multiplicity } = splitType(argumentType);

	switch (multiplicity) {
		case '?':
			if (!argument.isEmpty() && !argument.isSingleton()) {
				return null;
			}
			break;

		case '+':
			if (argument.isEmpty()) {
				return null;
			}
			break;

		case '*':
			break;

		default:
			if (!argument.isSingleton()) {
				return null;
			}
	}

	const transformedValues = [];
	for (let i = 0, l = argument.value.length; i < l; ++i) {
		let argumentItem = argument.value[i];
		if (argumentItem.instanceOfType(type)) {
			transformedValues.push(argumentItem);
			continue;
		}

		if (argumentItem.instanceOfType('node()')) {
			argumentItem = argumentItem.atomize();
		}

		if (argumentItem.instanceOfType('xs:untypedAtomic')) {
			// We might be able to cast this to the wished type
			const item = castToType(argumentItem, type);
			if (!item) {
				return null;
			}
			transformedValues.push(item);
			continue;
		}

		// We need to promote this
		const item = promoteToType(argumentItem, type);
		if (!item) {
			return null;
		}
		transformedValues.push(item);
	}
	return new Sequence(transformedValues);
};
