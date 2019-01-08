import tryCastToType from './casting/tryCastToType';
import AtomicValue from './AtomicValue';

export default function castToType(value: AtomicValue, type: string): AtomicValue {
	const result = tryCastToType(value, type);
	if (result.successful) {
		return result.value;
	}
	throw result.error;
}
