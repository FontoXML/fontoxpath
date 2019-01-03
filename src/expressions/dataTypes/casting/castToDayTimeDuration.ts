import createAtomicValue from '../createAtomicValue';
import DayTimeDuration from '../valueTypes/DayTimeDuration';

import CastResult from './CastResult';

const createDayTimeDurationValue = value => createAtomicValue(value, 'xs:dayTimeDuration');

export default function castToDayTimeDuration (instanceOf: (string) => boolean) : (Value) => CastResult {
	if (instanceOf('xs:duration') && !instanceOf('xs:yearMonthDuration')) {
		return value => ({
			successful: true,
			value: createDayTimeDurationValue(value.getDayTimeDuration())
		});
	}
	if (instanceOf('xs:yearMonthDuration')) {
		return () => ({
			successful: true,
			value: createDayTimeDurationValue(DayTimeDuration.fromString('PT0.0S'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => {
			const parsedDuration = DayTimeDuration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDayTimeDurationValue(parsedDuration)
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:dayTimeDuration`)
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:dayTimeDuration or any of its derived types.')
	});
}
