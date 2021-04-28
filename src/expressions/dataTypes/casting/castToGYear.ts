import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import DateTime from '../valueTypes/DateTime';
import CastResult from './CastResult';

const createGYearValue = (value) => createAtomicValue(value, { kind: BaseType.XSGYEAR });

export default function castToGYear(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf({ kind: BaseType.XSDATE }) || instanceOf({ kind: BaseType.XSDATETIME })) {
		return (value) => ({
			successful: true,
			value: createGYearValue(value.convertToType({ kind: BaseType.XSGYEAR })),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
		return (value) => ({
			successful: true,
			value: createGYearValue(DateTime.fromString(value)),
		});
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:gYear or any of its derived types.'
		),
	});
}
