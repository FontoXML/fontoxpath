import builtinDataTypesByName from './builtins/builtinDataTypesByName';

const valueCacheByValueByType = Object.create(null);

/**
* @param    {*}  value
* @param    {./ETypeNames}  type
* @returns  {?./AtomicValue<*>}
*/
export default function createAtomicValue (value, type) {
	if (!builtinDataTypesByName[type]) {
		return null;
	}

	if (type === 'xs:boolean' || type === 'xs:string' || type === 'xs:untypedAtomic' || type === 'xs:integer') {
		let cache = valueCacheByValueByType[type];

		if (!cache) {
			cache = valueCacheByValueByType[type] = Object.create(null);
		}
		let existingValue = cache[value];
		if (!existingValue) {
			existingValue = { type: type, value: value };
		}
		return existingValue;
	}
	const typedValue = {
		type: type,
		value: value
	};
	return typedValue;
}
