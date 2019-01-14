import AtomicValue from './AtomicValue';
import tryCastToType from './casting/tryCastToType';

export default function canCastToType(value: AtomicValue, type: string): boolean {
	const result = tryCastToType(value, type);
	return result.successful;
}
