import createAtomicValue from '../createAtomicValue';
import { ValueType, BaseType } from '../Value';
import YearMonthDuration from '../valueTypes/YearMonthDuration';
import CastResult from './CastResult';

const createYearMonthDurationValue = (value) =>
	createAtomicValue(value, { kind: BaseType.XSYEARMONTHDURATION });

export default function castToYearMonthDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (
		instanceOf({ kind: BaseType.XSDURATION }) &&
		!instanceOf({ kind: BaseType.XSDAYTIMEDURATION })
	) {
		return (value) => ({
			successful: true,
			value: createYearMonthDurationValue(value.getYearMonthDuration()),
		});
	}
	if (instanceOf({ kind: BaseType.XSDAYTIMEDURATION })) {
		return (_value) => ({
			successful: true,
			value: createYearMonthDurationValue(YearMonthDuration.fromString('P0M')),
		});
	}
	if (instanceOf({ kind: BaseType.XSUNTYPEDATOMIC }) || instanceOf({ kind: BaseType.XSSTRING })) {
		return (value) => {
			const parsedDuration = YearMonthDuration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createYearMonthDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Cannot cast "${value}" to xs:yearMonthDuration.`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:yearMonthDuration or any of its derived types.'
		),
	});
}
