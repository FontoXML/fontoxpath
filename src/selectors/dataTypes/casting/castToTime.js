import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createTimeValue = value => createAtomicValue(value, 'xs:time');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToTime (value, instanceOf) {
	if (instanceOf('xs:time')) {
		return {
			successful: true,
			value: createTimeValue(value)
		};
	}
	if (instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createTimeValue(value.convertToType('xs:time'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createTimeValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:time or any of its derived types.')
	};
}
