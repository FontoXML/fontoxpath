import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGDayValue = (value) => createAtomicValue(value, { kind: BaseType.XSGDAY });

export default function castToGDay(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE }) || instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createGDayValue(value.convertToType('xs:gDay')),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
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
