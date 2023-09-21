import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateValue = (value: any): AtomicValue => createAtomicValue(value, ValueType.XSDATE);

export default function castToDate(
	instanceOf: (typeName: ValueType) => boolean,
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDATETIME)) {
		return (value: DateTime) => ({
			successful: true,
			value: createDateValue(value.convertToType(ValueType.XSDATE)),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => ({
			successful: true,
			value: createDateValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:date or any of its derived types.',
		),
	});
}
