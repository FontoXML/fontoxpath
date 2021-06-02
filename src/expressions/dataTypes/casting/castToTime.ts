import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createTimeValue = (value: any): AtomicValue => createAtomicValue(value, ValueType.XSTIME);

export default function castToTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createTimeValue(value.convertToType(ValueType.XSTIME)),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createTimeValue(DateTime.fromString(value)),
		});
	}
	return (value) => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:time or any of its derived types.'
		),
	});
}
