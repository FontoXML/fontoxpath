import createAtomicValue from '../createAtomicValue';
import { BaseType, ValueType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createTimeValue = (value) => createAtomicValue(value, { kind: BaseType.XSTIME });

export default function castToTime(
	instanceOf: (typeName: ValueType) => boolean
): (value: DateTime) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createTimeValue(value.convertToType({ kind: BaseType.XSTIME })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
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
