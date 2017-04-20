import createAtomicValue from '../createAtomicValue';
import DateTime from '../valueTypes/DateTime';

const createDateTimeValue = value => createAtomicValue(value, 'xs:dateTime');

/**
 * @param  {./AtomicValueDataType}  value
 * @param   {function(string):boolean}       instanceOf
 * @return {{successful: boolean, value: ../AtomicValue<!../valueTypes/DateTime>}|{successful: boolean, error: !Error}}
 */
export default function castToDateTime (value, instanceOf) {
	if (instanceOf('xs:dateTime')) {
		return {
			successful: true,
			value: createDateTimeValue(value)
		};
	}
	if (instanceOf('xs:date')) {
		return {
			successful: true,
			value: createDateTimeValue(value.convertToType('xs:dateTime'))
		};
	}
	if (instanceOf('xs:untypedAtomic') || instanceOf('xs:string')) {
		return {
			successful: true,
			value: createDateTimeValue(DateTime.fromString(value))
		};
	}
	return {
		successful: false,
		error: new Error('XPTY0004: Casting not supported from given type to xs:dateTime or any of its derived types.')
	};
}
