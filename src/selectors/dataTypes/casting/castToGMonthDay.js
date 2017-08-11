import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGMonthDayValue = value => createAtomicValue(value, 'xs:gMonthDay');

/**
 * @param  {function(string):boolean}  instanceOf
 * @return {function (./AtomicValueDataType) : ({successful: boolean, value: ../AtomicValue}|{successful: boolean, error: !Error})}
 */
export default function castToGMonthDay (instanceOf) {
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return value => ({
			successful: true,
			value: createGMonthDayValue(value.convertToType('xs:gMonthDay'))
		});
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return value => ({
			successful: true,
			value: createGMonthDayValue(DateTime.fromString(value))
		});
	}
	return () => ({
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gMonthDay or any of its derived types.')
	});
}
