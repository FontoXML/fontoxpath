import tryCastToType from './casting/tryCastToType';
import AtomicValue from './AtomicValue';

export default function canCastToType (value: AtomicValue, type: string): boolean {
	const result = tryCastToType(value, type);
	return result.successful;
}
