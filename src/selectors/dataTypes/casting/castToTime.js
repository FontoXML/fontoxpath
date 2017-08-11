import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createTimeValue = value => createAtomicValue(value, 'xs:time');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToTime (instanceOf) {
	if (instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createTimeValue(value.convertToType('xs:time'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createTimeValue(DateTime.fromString(value))
		});
	}
	return value => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:time or any of its derived types.')
	});
}
