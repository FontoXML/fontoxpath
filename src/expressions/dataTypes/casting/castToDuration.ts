import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import Duration from '../valueTypes/Duration';
import CastResult from './CastResult';

const createDurationValue = (value: Duration) => createAtomicValue(value, ValueType.XSDURATION);

export default function castToDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromYearMonthDuration(value)),
		});
	}
	if (instanceOf(ValueType.XSDAYTIMEDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(Duration.fromDayTimeDuration(value)),
		});
	}
	if (instanceOf(ValueType.XSDURATION)) {
		return (value) => ({
			successful: true,
			value: createDurationValue(value),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => {
			const parsedDuration = Duration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:duration`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:duration or any of its derived types.'
		),
	});
}
