import castToType from '../dataTypes/castToType';
import promoteToType from '../dataTypes/promoteToType';
import isInstanceOfType from '../dataTypes/isInstanceOfType';
import atomize from '../dataTypes/atomize';

import Sequence from '../dataTypes/Sequence';

/**
 * @param   {string}          type
 * @return  {!{type: string, multiplicity: string}}
 */
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
 * @param   {!../DynamicContext}  dynamicContext
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
		if (isInstanceOfType(argumentItem, type)) {
			return argumentItem;
		}

		if (isInstanceOfType(argumentItem, 'node()')) {
			argumentItem = atomize(argumentItem, dynamicContext);
		}
		// Everything is an anyAtomicType, so no casting necessary.
		if (type === 'xs:anyAtomicType') {
			return argumentItem;
		}
		if (isInstanceOfType(argumentItem, 'xs:untypedAtomic')) {
			// We might be able to cast this to the wished type
			const item = castToType(argumentItem, type);
			if (!item) {
				throw new Error('XPTY0004 Unable to convert to type');
			}
			return item;
		}

		// We need to promote this
		const item = promoteToType(argumentItem, type);
		if (!item) {
			throw new Error('XPTY0004 Unable to convert to type');
		}
		return item;
	});
};
