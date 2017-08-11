import createAtomicValue from '../createAtomicValue';
import Duration from '../valueTypes/Duration';

const createDayTimeDurationValue = value => createAtomicValue(value, 'xs:dayTimeDuration');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToDayTimeDuration (instanceOf) {
	if (instanceOf('xs:duration') && !instanceOf('xs:yearMonthDuration')) {
		return value => ({
			successful: true,
			value: createDayTimeDurationValue(value.toDayTime())
		});
	}
	if (instanceOf('xs:yearMonthDuration')) {
		return () => ({
			successful: true,
			value: createDayTimeDurationValue(Duration.fromString('PT0.0S', 'xs:dayTimeDuration'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => {
			const parsedDuration = Duration.fromString(value, 'xs:dayTimeDuration');
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
