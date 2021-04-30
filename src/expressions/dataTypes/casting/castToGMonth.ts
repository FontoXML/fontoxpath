import AtomicValue from '../AtomicValue';
import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGMonthValue = (value) => createAtomicValue(value, { kind: BaseType.XSGMONTH });

export default function castToGMonth(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE }) || instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(value.convertToType({ kind: BaseType.XSGMONTH })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
		return (value) => ({
			successful: true,
			value: createGMonthValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gMonth or any of its derived types.'
		),
	});
}
