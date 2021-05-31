import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGDayValue = (value: any): AtomicValue => createAtomicValue(value, ValueType.XSGDAY);

export default function castToGDay(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDATE) || instanceOf(ValueType.XSDATETIME)) {
		return (value: DateTime) => ({
			successful: true,
			value: createGDayValue(value.convertToType(ValueType.XSGDAY)),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gDay or any of its derived types.'
		),
	});
}
