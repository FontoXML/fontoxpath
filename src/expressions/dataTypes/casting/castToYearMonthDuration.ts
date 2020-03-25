import createAtomicValue from '../createAtomicValue';
import YearMonthDuration from '../valueTypes/YearMonthDuration';

import CastResult from './CastResult';

const createYearMonthDurationValue = (value) => createAtomicValue(value, 'xs:yearMonthDuration');

export default function castToYearMonthDuration(
	instanceOf: (string) => boolean
): (Value) => CastResult {
	if (instanceOf('xs:duration') && !instanceOf('xs:dayTimeDuration')) {
		return (value) => ({
			successful: true,
			value: createYearMonthDurationValue(value.getYearMonthDuration()),
		});
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return (_value) => ({
			successful: true,
			value: createYearMonthDurationValue(YearMonthDuration.fromString('P0M')),
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
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
