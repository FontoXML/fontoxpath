import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createGMonthValue = value => createAtomicValue(value, 'xs:gMonth');

/**
 * @param  {./AtomicValueDataType}  value
 * @param  {function(string):boolean}  instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToGMonth (value, instanceOf) {
	if (instanceOf('xs:gMonth')) {
		return {
			successful: true,
			value: createGMonthValue(value)
		};
	}
	if (instanceOf('xs:date') || instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createGMonthValue(value.convertToType('xs:gMonth'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createGMonthValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:gMonth or any of its derived types.')
	};
}
