import createAtomicValue from '../createAtomicValue';
import Duration from '../valueTypes/Duration';

const createDurationValue = value => createAtomicValue(value, 'xs:duration');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToDuration (instanceOf) {
	if (instanceOf('xs:duration')) {
		// Also for instanceOf('xs:dayTimeDuration') and instanceOf('xs:yearMonthDuration')
		return value => ({
			successful: true,
			value: createDurationValue(value)
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => {
			const parsedDuration = Duration.fromString(value, 'xs:duration');
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
