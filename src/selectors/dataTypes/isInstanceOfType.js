import builtinDataTypesByName from './builtins/builtinDataTypesByName';

/**
 * @param  {./Value} value
 * @param  {./ETypeNames}  type
 */
export default function isInstanceOfType (value, type) {
	if (value.type === type) {
		return true;
	}

	return builtinDataTypesByName[value.type].instanceOfType(type);
}
