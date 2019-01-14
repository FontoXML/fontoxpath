import AtomicValue from './AtomicValue';
import CastResult from './casting/CastResult';
import tryCastToType from './casting/tryCastToType';

export default function castToType(value: AtomicValue, type: string): AtomicValue {
	const result = tryCastToType(value, type);
	if (result.successful === true) {
		return result.value;
	}
	throw result.error;
}
