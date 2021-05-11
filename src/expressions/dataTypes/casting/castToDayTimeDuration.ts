import createAtomicValue from '../createAtomicValue';
import { ValueType } from '../Value';
import DayTimeDuration from '../valueTypes/DayTimeDuration';
import CastResult from './CastResult';

const createDayTimeDurationValue = (value: DayTimeDuration) =>
	createAtomicValue(value, ValueType.XSDAYTIMEDURATION);

export default function castToDayTimeDuration(
	instanceOf: (typeName: ValueType) => boolean
): (value: any) => CastResult {
	if (instanceOf(ValueType.XSDURATION) && !instanceOf(ValueType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: createDayTimeDurationValue(value.getDayTimeDuration()),
		});
	}
	if (instanceOf(ValueType.XSYEARMONTHDURATION)) {
		return () => ({
			successful: true,
			value: createDayTimeDurationValue(DayTimeDuration.fromString('PT0.0S')),
		});
	}
	if (instanceOf(ValueType.XSUNTYPEDATOMIC) || instanceOf(ValueType.XSSTRING)) {
		return (value) => {
			const parsedDuration = DayTimeDuration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDayTimeDurationValue(parsedDuration),
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:dayTimeDuration`),
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error(
			'XPTY0004: Casting not supported from given type to xs:dayTimeDuration or any of its derived types.'
		),
	});
}
