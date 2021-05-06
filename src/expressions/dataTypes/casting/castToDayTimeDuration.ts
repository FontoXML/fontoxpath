import createAtomicValue from '../createAtomicValue';
import { SequenceType, ValueType } from '../Value';
import { BaseType } from '../BaseType';
import DayTimeDuration from '../valueTypes/DayTimeDuration';
import CastResult from './CastResult';

const createDayTimeDurationValue = (value) =>
	createAtomicValue(value, {
		kind: BaseType.XSDAYTIMEDURATION,
		seqType: SequenceType.EXACTLY_ONE,
	});

export default function castToDayTimeDuration(
	instanceOf: (typeName: BaseType) => boolean
): (value) => CastResult {
	if (instanceOf(BaseType.XSDURATION) && !instanceOf(BaseType.XSYEARMONTHDURATION)) {
		return (value) => ({
			successful: true,
			value: createDayTimeDurationValue(value.getDayTimeDuration()),
		});
	}
	if (instanceOf(BaseType.XSYEARMONTHDURATION)) {
		return () => ({
			successful: true,
			value: createDayTimeDurationValue(DayTimeDuration.fromString('PT0.0S')),
		});
	}
	if (instanceOf(BaseType.XSUNTYPEDATOMIC) || instanceOf(BaseType.XSSTRING)) {
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
