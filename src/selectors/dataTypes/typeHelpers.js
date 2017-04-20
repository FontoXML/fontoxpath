import builtinDataTypesByName from './builtins/builtinDataTypesByName';
/**
 * @param   {string}  typeName
 * @return  {string}
 */
export function getPrimitiveTypeName (typeName) {
	return builtinDataTypesByName[typeName].getPrimitiveType();
}

/**
 * @param   {string}  string
 * @param   {string}  typeName
 * @return  {string}
 */
export function normalizeWhitespace (string, typeName) {
	return builtinDataTypesByName[typeName].normalizeWhitespace(string);
}
/**
 * @param   {string}   string
 * @param   {string}   typeName
 * @return  {boolean}
 */
export function validatePattern (string, typeName) {
	return builtinDataTypesByName[typeName].validatePattern(string);
}
/**
 * @param   {string}  value
 * @param   {string}  typeName
 * @return  {boolean}
 */
export function validateRestrictions (value, typeName) {
	return builtinDataTypesByName[typeName].validateRestrictions(value);
}
