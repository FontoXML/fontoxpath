import createAtomicValue from '../createAtomicValue';
import Duration from '../valueTypes/Duration';

const createYearMonthDurationValue = value => createAtomicValue(value, 'xs:yearMonthDuration');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToYearMonthDuration (instanceOf) {
	if (instanceOf('xs:duration') && !instanceOf('xs:dayTimeDuration')) {
		return value => ({
			successful: true,
			value: createYearMonthDurationValue(value.toYearMonth())
		});
	}
	if (instanceOf('xs:dayTimeDuration')) {
		return value => ({
			successful: true,
			value: createYearMonthDurationValue(Duration.fromString('P0M', 'xs:yearMonthDuration'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => {
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
		};
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:yearMonthDuration or any of its derived types.')
	});
}
