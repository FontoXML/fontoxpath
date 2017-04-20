import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGYearMonthValue = value => createAtomicValue(value, 'xs:gYearMonth');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToGYearMonth (value, instanceOf) {
	if (instanceOf('xs:gYearMonth')) {
		return {
			successful: true,
			value: createGYearMonthValue(value)
		};
	}
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createGYearMonthValue(value.convertToType('xs:gYearMonth'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createGYearMonthValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gYearMonth or any of its derived types.')
	};
}
