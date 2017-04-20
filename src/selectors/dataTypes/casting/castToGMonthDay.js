import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGMonthDayValue = value => createAtomicValue(value, 'xs:gMonthDay');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToGMonthDay (value, instanceOf) {
	if (instanceOf('xs:gMonthDay')) {
		return {
			successful: true,
			value: createGMonthDayValue(value)
		};
	}
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createGMonthDayValue(value.convertToType('xs:gMonthDay'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createGMonthDayValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gMonthDay or any of its derived types.')
	};
}
