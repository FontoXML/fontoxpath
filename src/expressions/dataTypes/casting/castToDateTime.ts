import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateTimeValue = (value) => createAtomicValue(value, { kind: BaseType.XSDATETIME });

export default function castToDateTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE })) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(value.convertToType({ kind: BaseType.XSDATETIME })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
		return (value) => ({
			successful: true,
			value: createDateTimeValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.'
		),
	});
}
