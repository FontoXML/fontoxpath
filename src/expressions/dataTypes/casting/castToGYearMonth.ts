import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGYearMonthValue = (value: any): AtomicValue =>
	createAtomicValue(value, ValueType.XSGYEARMONTH);

export default function castToGYearMonth(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf(ValueType.XSDATE) || instanceOf(ValueType.XSDATETIME)) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(value.convertToType(ValueType.XSGYEARMONTH)),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createGYearMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.'
		),
	});
}
