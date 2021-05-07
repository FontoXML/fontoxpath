import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthDayValue = (value: any): AtomicValue =>
	createAtomicValue(value, ValueType.XSGMONTHDAY);

export default function castToGMonthDay(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf(ValueType.XSDATE) || instanceOf(ValueType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(value.convertToType(ValueType.XSGMONTHDAY)),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonthDay or any of its derived types.'
		),
	});
}
