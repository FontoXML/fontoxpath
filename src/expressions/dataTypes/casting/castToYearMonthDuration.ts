import createAtomicValue from '../createAtomicValue';
import { SequenceMultiplicity, ValueType } from '../Value';
import YearMonthDuration from '../valueTypes/YearMonthDuration';
import CastResult from './CastResult';

const createYearMonthDurationValue = (value) =>
	createAtomicValue(value, ValueType.XSYEARMONTHDURATION);

export default function castToYearMonthDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value) => CastResult {
	if (instanceOf(ValueType.XSDURATION) && !instanceOf(ValueType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: createYearMonthDurationValue(value.getYearMonthDuration()),
		});
	}
	if (instanceOf(ValueType.XSDAYTIMEDURATION)) {
		return (_value) => ({
			successful: true,
			value: createYearMonthDurationValue(YearMonthDuration.fromString('P0M')),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
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
