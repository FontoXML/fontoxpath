import tryCastToType from './casting/tryCastToType';
/**
 * @param   {!./AtomicValue<*>}  value
 * @param   {string}    type
 * @return  {!./AtomicValue<*>}
 */
export default function castToType (value, type) {
	const result = tryCastToType(value, type);
	if (result.successful) {
		return result.value;
	}
	throw result.error;
}
