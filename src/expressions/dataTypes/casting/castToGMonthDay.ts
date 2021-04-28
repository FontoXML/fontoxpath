import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthDayValue = (value) => createAtomicValue(value, { kind: BaseType.XSGMONTHDAY });

export default function castToGMonthDay(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE }) || instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createGMonthDayValue(value.convertToType({ kind: BaseType.XSGMONTHDAY })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
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
