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
 * @param   {string}           argumentType
 * @param   {!Sequence}        argument
 * @param   {!../DynamicContext.default}  dynamicContext
 * @return  {?Sequence}
 */
export const transformArgument = (argumentType, argument, dynamicContext) => {
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

	return argument.map(argumentItem => {
		if (argumentItem.instanceOfType(type)) {
			return argumentItem;
		}

		if (argumentItem.instanceOfType('node()')) {
			argumentItem = argumentItem.atomize(dynamicContext);
		}
		// Everything is an anyAtomicType, so no casting necessary.
		if (type === 'xs:anyAtomicType') {
			return argumentItem;
		}
		if (argumentItem.instanceOfType('xs:untypedAtomic')) {
			// We might be able to cast this to the wished type
			const item = castToType(argumentItem, type);
			if (!item) {
				throw new Error('Unable to convert to type');
			}
			return item;
		}

		// We need to promote this
		const item = promoteToType(argumentItem, type);
		if (!item) {
			throw new Error('Unable to convert to type');
		}
		return item;
	});
};
