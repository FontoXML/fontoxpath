import builtinDataTypesByName from './builtins/builtinDataTypesByName';

const instanceOfTypeShortcutTable = Object.create(null);

/**
 * @param  {./Value} value
 * @param  {./ETypeNames}  type
 */
export default function isInstanceOfType (value, type) {
	if (value.type === type) {
		return true;
	}
	return builtinDataTypesByName[value.type].instanceOfType(type);
	// const compareKey = `${value.type}~${type}`;

	// let precomputedValue = instanceOfTypeShortcutTable[compareKey];
	// if (precomputedValue === undefined) {
	// 	precomputedValue = instanceOfTypeShortcutTable[compareKey] =
	// }

	// return precomputedValue;
}
