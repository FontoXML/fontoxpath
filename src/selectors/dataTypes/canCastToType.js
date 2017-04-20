import tryCastToType from './casting/tryCastToType';

/**
 * @param   {!./AtomicValue<*>}  value
 * @param   {string}               type
 * @return  {boolean}
 */
export default function canCastToType (value, type) {
	const result = tryCastToType(value, type);
	return result.successful;
}
