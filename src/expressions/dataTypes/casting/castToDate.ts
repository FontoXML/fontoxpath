import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createDateValue = (value) => createAtomicValue(value, { kind: BaseType.XSDATE });

export default function castToDate(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createDateValue(value.convertToType({ kind: BaseType.XSDATE })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
		return (value) => ({
			successful: true,
			value: createDateValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:date or any of its derived types.'
		),
	});
}
