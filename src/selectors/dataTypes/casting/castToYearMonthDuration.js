import createAtomicValue from '../createAtomicValue';
import Duration from '../valueTypes/Duration';

const createYearMonthDurationValue = value => createAtomicValue(value, 'xs:yearMonthDuration');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/Duration>}|{successful: boolean, error: !Error}}
 */
export default function castToYearMonthDuration (value, instanceOf) {
	if (instanceOf('xs:yearMonthDuration')) {
		return {
			successful: true,
			value: createYearMonthDurationValue(value)
		};
	}
	if (instanceOf('xs:duration') && !instanceOf('xs:dayTimeDuration')) {
		return {
			successful: true,
			value: createYearMonthDurationValue(value.toYearMonth())
		};
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return {
			successful: true,
			value: createYearMonthDurationValue(Duration.fromString('P0M', 'xs:yearMonthDuration'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		const parsedDuration = Duration.fromString(value, 'xs:yearMonthDuration');
		if (parsedDuration) {
			return {
				successful: true,
				value: createYearMonthDurationValue(parsedDuration)
			};
		}
		return {
			successful: false,
			error: new Error(`FORG0001: Cannot cast "${value}" to xs:yearMonthDuration.`)
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:yearMonthDuration or any of its derived types.')
	};
}
