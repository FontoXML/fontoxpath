import builtinDataTypesByName from './builtins/builtinDataTypesByName';

/**
* @param    {*}  value
* @param    {./ETypeNames}  type
* @returns  {?./AtomicValue<*>}
*/
export default function createAtomicValue (value, type) {
	if (!builtinDataTypesByName[type]) {
		return null;
	}

	const typedValue = {
		type: type,
		value: value
	};
	return typedValue;
}
