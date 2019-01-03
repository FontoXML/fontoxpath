import createAtomicValue from '../createAtomicValue';
import Duration from '../valueTypes/Duration';

import CastResult from './CastResult';

const createDurationValue = value => createAtomicValue(value, 'xs:duration');

export default function castToDuration (instanceOf: (string) => boolean) : (Value) => CastResult {
	if (instanceOf('xs:yearMonthDuration')) {
		return value => ({
			successful: true,
			value: createDurationValue(Duration.fromYearMonthDuration(value))
		});
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return value => ({
			successful: true,
			value: createDurationValue(Duration.fromDayTimeDuration(value))
		});
	}
	if (instanceOf('xs:duration')) {
		return value => ({
			successful: true,
			value: createDurationValue(value)
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => {
			const parsedDuration = Duration.fromString(value);
			if (parsedDuration) {
				return {
					successful: true,
					value: createDurationValue(parsedDuration)
				};
			}
			return {
				successful: false,
				error: new Error(`FORG0001: Can not cast ${value} to xs:duration`)
			};
		};
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:duration or any of its derived types.')
	});
}
