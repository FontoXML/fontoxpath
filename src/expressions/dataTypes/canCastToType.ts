import AtomicValue from './AtomicValue';
import tryCastToType from './casting/tryCastToType';
import { ValueType } from './Value';

export default function canCastToType(value: AtomicValue, type: ValueType): boolean {
	const result = tryCastToType(value, type.kind);
	return result.successful;
}
