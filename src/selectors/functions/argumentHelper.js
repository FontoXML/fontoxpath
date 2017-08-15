import castToType from '../dataTypes/castToType';
import promoteToType from '../dataTypes/promoteToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
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

function mapItem (argumentItem, type, dynamicContext) {
	if (isSubtypeOf(argumentItem.type, type)) {
		return argumentItem;
	}

	if (isSubtypeOf(argumentItem.type, 'node()')) {
		argumentItem = atomize(argumentItem, dynamicContext);
	}
	// Everything is an anyAtomicType, so no casting necessary.
	if (type === 'xs:anyAtomicType') {
		return argumentItem;
	}
	if (isSubtypeOf(argumentItem.type, 'xs:untypedAtomic')) {
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
}

/**
 * Test whether the provided argument is valid to be used as an function argument of the given type
 * @param   {string}              argumentType
 * @param   {!Sequence}           argument
 * @param   {!../DynamicContext}  dynamicContext
 * @param   {string}              functionName       Used for debugging purposes
 * @return  {?Sequence}
 */
export const transformArgument = (argumentType, argument, dynamicContext, functionName) => {
	const { type, multiplicity } = splitType(argumentType);
	switch (multiplicity) {
		case '?':
			return argument.switchCases({
				default: () => argument.map(value => mapItem(value, type, dynamicContext)),
				multiple: () => {
					throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType} for ${functionName} is incorrect. Expected "?", but got "+".`);
				}
			});
		case '+':
			return argument.switchCases({
				empty: () => {
					throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType} for ${functionName} is incorrect. Expected "+", but got "empty-sequence()"`);
				},
				default: () => argument.map(value => mapItem(value, type, dynamicContext))
			});
		case '*':
			return argument.map(value => mapItem(value, type, dynamicContext));
		default:
			// excactly one
			return argument.switchCases({
				singleton: () => argument.map(value => mapItem(value, type, dynamicContext)),
				default: () => {
					throw new Error(`XPTY0004: Multiplicity of function argument of type ${argumentType} for ${functionName} is incorrect. Expected exactly one`);
}
			});
	}
};
