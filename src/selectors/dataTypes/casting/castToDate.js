import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createDateValue = value => createAtomicValue(value, 'xs:date');

/**
 * @param  {./AtomicValueDataType}  value
 * @param   {function(string):boolean}        instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToDate (value, instanceOf) {
	if (instanceOf('xs:date')) {
		return {
			successful: true,
			value: createDateValue(value)
		};
	}
	if (instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createDateValue(value.convertToType('xs:date'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createDateValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:date or any of its derived types.')
	};
}
