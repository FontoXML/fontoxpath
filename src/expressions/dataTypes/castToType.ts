import AtomicValue from './AtomicValue';
import tryCastToType from './casting/tryCastToType';
import { ValueType } from './Value';

export default function castToType(value: AtomicValue, type: ValueType): AtomicValue {
	const result = tryCastToType(value, type);
	if (result.successful === true) {
		return result.value;
	}
	throw result.error;
}
